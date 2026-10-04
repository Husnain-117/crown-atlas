import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { COUNTIES, type CountyCity } from "../src/lib/counties"

const USER_AGENT = "CrownCoastalHomesLocationImages/1.0 (djelveh.m@gmail.com)"
const OUTPUT_JSON = path.join(process.cwd(), "src/lib/california-location-image-data.json")
const CITY_OUTPUT_DIR = path.join(process.cwd(), "public/city/california")
const COUNTY_OUTPUT_DIR = path.join(process.cwd(), "public/County/california")
const METADATA_CACHE = "/tmp/california-location-image-resolution-cache.json"
const WRITE = process.argv.includes("--write")
const REQUEST_CONCURRENCY = 5
const DOWNLOAD_CONCURRENCY = 1
const CURATED_CITY_COUNTIES = new Set(["los-angeles", "san-diego"])

const ALLOWED_LICENSE = /^(cc0|cc by|cc by-sa|public domain|pd)/i
const BAD_FILE_TITLE =
  /\b(flag|seal|logo|locator|map|coat of arms|wordmark|icon|diagram|route sign|city limits sign)\b/i

interface ImageCandidate {
  downloadUrl: string
  sourceUrl: string
  creator: string
  license: string
  licenseUrl: string
  fileTitle: string
  width: number
  height: number
}

interface LocationTarget {
  kind: "city" | "county"
  slug: string
  name: string
  countySlug: string
  countyName: string
  wikipediaTitle: string
  searchQuery: string
}

interface LocationImageRecord {
  kind: "city" | "county"
  slug: string
  name: string
  countySlug: string
  countyName: string
  src: string
  alt: string
  attractionLabel: string
  creator: string
  license: string
  licenseUrl: string
  sourceUrl: string
  wikipediaUrl: string
  fileTitle: string
}

const WIKIPEDIA_TITLE_OVERRIDES: Record<string, string> = {
  "industry-ca": "City of Industry, California",
  "san-francisco-ca": "San Francisco",
  "mission": "Mission District, San Francisco",
  "castro": "Castro District, San Francisco",
  "soma": "South of Market, San Francisco",
  "sunset": "Sunset District, San Francisco",
  "richmond": "Richmond District, San Francisco",
  "marina": "Marina District, San Francisco",
  "chinatown": "Chinatown, San Francisco",
  "presidio": "Presidio of San Francisco",
  "financial-district": "Financial District, San Francisco",
}

const COUNTY_WIKIPEDIA_TITLE_OVERRIDES: Record<string, string> = {
  "san-francisco": "San Francisco",
}

const COMMONS_FILE_OVERRIDES: Record<string, string> = {
  "city:buellton-ca": "Farm scene in Buellton, California LCCN2013633358.tif",
  "city:farmersville-ca": "Farmersville Methodist Church.jpg",
  "city:lompoc-ca": "Downtown Lompoc 2009.jpg",
  "city:needles-ca": "Colorado River and the Needles (3227891318) - cropped.jpg",
  "city:rolling-hills-ca":
    "Rolling Hills General Store, Corner Crenshaw and Palos Verdes Drive North (near Main Gate House to) Rolling Hills, Calif (83802).jpg",
  "city:san-rafael-ca":
    "Mission San Rafael Arcángel - Febraury 2025 - Sarah Stierch.jpg",
  "city:temecula-ca": "Old Town Temecula.jpg",
  "city:vacaville-ca": "Aerial view of Vacaville, California.jpg",
  "city:villa-park-ca": "City Hall, Civic Center, Villa Park, California.jpg",
  "county:kings": "Sunny Morning in Downtown Hanford (15541298548).jpg",
}

function targetKey(target: LocationTarget): string {
  return `${target.kind}:${target.slug}`
}

function cityWikipediaTitle(city: CountyCity, countySlug: string): string {
  const override = WIKIPEDIA_TITLE_OVERRIDES[city.slug]
  if (override) return override
  if (countySlug === "san-francisco" && !city.slug.endsWith("-ca")) {
    return `${city.name}, San Francisco`
  }
  return `${city.name}, California`
}

function buildTargets(): LocationTarget[] {
  return COUNTIES.flatMap((county) => {
    const countyTitle =
      COUNTY_WIKIPEDIA_TITLE_OVERRIDES[county.slug] ?? `${county.name}, California`
    const countyTarget: LocationTarget = {
      kind: "county",
      slug: county.slug,
      name: county.name,
      countySlug: county.slug,
      countyName: county.name,
      wikipediaTitle: countyTitle,
      searchQuery: `${county.name} California landscape`,
    }
    const cityTargets = CURATED_CITY_COUNTIES.has(county.slug)
      ? []
      : county.cities.map((city): LocationTarget => ({
          kind: "city",
          slug: city.slug,
          name: city.name,
          countySlug: county.slug,
          countyName: county.name,
          wikipediaTitle: cityWikipediaTitle(city, county.slug),
          searchQuery:
            county.slug === "san-francisco" && !city.slug.endsWith("-ca")
              ? `${city.name} San Francisco`
              : `${city.name} ${county.name} California`,
        }))
    return [countyTarget, ...cityTargets]
  })
}

function apiUrl(host: string, params: Record<string, string>): string {
  const url = new URL(`https://${host}/w/api.php`)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return url.toString()
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(url: string, attempt = 0): Promise<any> {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } })
  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    const retryAfter = Number(response.headers.get("retry-after") ?? 0)
    await sleep(Math.max(retryAfter * 1000, 500 * 2 ** attempt))
    return fetchJson(url, attempt + 1)
  }
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.json()
}

function plainText(value: string | undefined): string {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim()
}

function candidateFromImageInfo(page: any): ImageCandidate | null {
  const info = page?.imageinfo?.[0]
  if (!info) return null
  const metadata = info.extmetadata ?? {}
  const license = plainText(metadata.LicenseShortName?.value)
  const mime = String(info.mime ?? "")
  const width = Number(info.width ?? 0)
  const height = Number(info.height ?? 0)
  if (!ALLOWED_LICENSE.test(license)) return null
  if (!mime.startsWith("image/") || /svg|gif/i.test(mime)) return null
  if (width < 600 || height < 350) return null
  if (BAD_FILE_TITLE.test(String(page.title ?? ""))) return null

  const licenseUrl =
    plainText(metadata.LicenseUrl?.value) ||
    (/public domain|^pd$/i.test(license)
      ? "https://creativecommons.org/publicdomain/mark/1.0/"
      : "https://creativecommons.org/licenses/")

  return {
    downloadUrl: info.thumburl || info.url,
    sourceUrl: info.descriptionurl || info.descriptionshorturl || info.url,
    creator: plainText(metadata.Artist?.value) || "Wikimedia Commons contributor",
    license,
    licenseUrl: licenseUrl.replace(/^http:\/\//i, "https://"),
    fileTitle: String(page.title ?? "").replace(/^File:/i, ""),
    width,
    height,
  }
}

async function getCommonsCandidate(fileTitle: string): Promise<ImageCandidate | null> {
  const data = await fetchJson(
    apiUrl("commons.wikimedia.org", {
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      prop: "imageinfo",
      iiprop: "url|mime|size|extmetadata",
      iiurlwidth: "1600",
      titles: `File:${fileTitle}`,
    })
  )
  return candidateFromImageInfo(data?.query?.pages?.[0])
}

async function getWikipediaPageImage(
  target: LocationTarget
): Promise<{ candidate: ImageCandidate; pageTitle: string } | null> {
  const data = await fetchJson(
    apiUrl("en.wikipedia.org", {
      action: "query",
      format: "json",
      formatversion: "2",
      redirects: "1",
      prop: "pageimages",
      pilicense: "free",
      piprop: "name|original",
      pithumbsize: "1600",
      titles: target.wikipediaTitle,
    })
  )
  const page = data?.query?.pages?.[0]
  if (!page || page.missing || !page.pageimage) return null
  const candidate = await getCommonsCandidate(page.pageimage)
  return candidate ? { candidate, pageTitle: page.title } : null
}

async function searchCommons(target: LocationTarget): Promise<ImageCandidate | null> {
  const data = await fetchJson(
    apiUrl("commons.wikimedia.org", {
      action: "query",
      format: "json",
      formatversion: "2",
      generator: "search",
      gsrnamespace: "6",
      gsrlimit: "20",
      gsrsearch: target.searchQuery,
      prop: "imageinfo",
      iiprop: "url|mime|size|extmetadata",
      iiurlwidth: "1600",
    })
  )
  const candidates = (data?.query?.pages ?? [])
    .map(candidateFromImageInfo)
    .filter(Boolean) as ImageCandidate[]
  const landscape = candidates.find(
    (candidate) =>
      candidate.width / candidate.height >= 1.1 &&
      candidate.width / candidate.height <= 3
  )
  return landscape ?? candidates[0] ?? null
}

async function resolveTarget(
  target: LocationTarget
): Promise<{ target: LocationTarget; candidate: ImageCandidate; pageTitle: string } | null> {
  try {
    const fileOverride = COMMONS_FILE_OVERRIDES[targetKey(target)]
    if (fileOverride) {
      const candidate = await getCommonsCandidate(fileOverride)
      if (candidate) {
        return {
          target,
          candidate,
          pageTitle: target.wikipediaTitle,
        }
      }
    }
    const pageImage = await getWikipediaPageImage(target)
    if (pageImage) return { target, ...pageImage }
    const searched = await searchCommons(target)
    if (searched) {
      return {
        target,
        candidate: searched,
        pageTitle: target.wikipediaTitle,
      }
    }
    console.warn(`[missing] ${target.kind} ${target.countySlug}/${target.slug}`)
    return null
  } catch (error) {
    console.warn(
      `[error] ${target.kind} ${target.countySlug}/${target.slug}:`,
      error instanceof Error ? error.message : error
    )
    return null
  }
}

async function mapConcurrent<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const output = new Array<R>(items.length)
  let nextIndex = 0
  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      output[index] = await mapper(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  return output
}

async function fetchBuffer(url: string, attempt = 0): Promise<Buffer> {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } })
  if ((response.status === 429 || response.status >= 500) && attempt < 10) {
    const retryAfter = Number(response.headers.get("retry-after") ?? 0)
    const waitMs = Math.max(retryAfter * 1000, Math.min(30_000, 2_000 * 2 ** attempt))
    console.warn(`  download retry ${attempt + 1} after ${waitMs}ms (${response.status})`)
    await sleep(waitMs)
    return fetchBuffer(url, attempt + 1)
  }
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return Buffer.from(await response.arrayBuffer())
}

function outputPath(target: LocationTarget): { filePath: string; publicPath: string } {
  if (target.kind === "county") {
    return {
      filePath: path.join(COUNTY_OUTPUT_DIR, `${target.slug}.webp`),
      publicPath: `/County/california/${target.slug}.webp`,
    }
  }
  return {
    filePath: path.join(CITY_OUTPUT_DIR, target.countySlug, `${target.slug}.webp`),
    publicPath: `/city/california/${target.countySlug}/${target.slug}.webp`,
  }
}

async function main(): Promise<void> {
  const targets = buildTargets()
  console.log(`Resolving ${targets.length} California county and city images...`)
  let cachedItems: Array<{
    target: LocationTarget
    candidate: ImageCandidate
    pageTitle: string
  }> = []
  try {
    cachedItems = JSON.parse(await fs.readFile(METADATA_CACHE, "utf8"))
  } catch {
    cachedItems = []
  }
  const cache = new Map(
    cachedItems.map((item) => [targetKey(item.target), item])
  )

  const resolved = (
    await mapConcurrent(targets, REQUEST_CONCURRENCY, async (target, index) => {
      const key = targetKey(target)
      const result =
        (COMMONS_FILE_OVERRIDES[key] ? null : cache.get(key)) ??
        (await resolveTarget(target))
      if (result) cache.set(key, result)
      if ((index + 1) % 25 === 0 || index + 1 === targets.length) {
        console.log(`  metadata ${index + 1}/${targets.length}`)
      }
      return result
    })
  ).filter(Boolean) as Array<{
    target: LocationTarget
    candidate: ImageCandidate
    pageTitle: string
  }>
  await fs.writeFile(METADATA_CACHE, `${JSON.stringify([...cache.values()], null, 2)}\n`)

  const missing = targets.filter(
    (target) =>
      !resolved.some(
        (item) => item.target.kind === target.kind && item.target.slug === target.slug
      )
  )
  if (missing.length > 0) {
    console.error(`Missing ${missing.length} images:`)
    for (const target of missing) {
      console.error(`  ${target.kind} ${target.countySlug}/${target.slug}`)
    }
    process.exitCode = 1
    return
  }

  if (WRITE) {
    await fs.mkdir(CITY_OUTPUT_DIR, { recursive: true })
    await fs.mkdir(COUNTY_OUTPUT_DIR, { recursive: true })
    const downloadCache = new Map<string, Promise<Buffer>>()

    await mapConcurrent(resolved, DOWNLOAD_CONCURRENCY, async (item, index) => {
      const { filePath } = outputPath(item.target)
      const hasOverride = Boolean(COMMONS_FILE_OVERRIDES[targetKey(item.target)])
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      try {
        const existing = await fs.stat(filePath)
        if (existing.size > 40_000 && !hasOverride) {
          if ((index + 1) % 25 === 0 || index + 1 === resolved.length) {
            console.log(`  images ${index + 1}/${resolved.length}`)
          }
          return
        }
      } catch {
        // Download missing files below.
      }
      let download = downloadCache.get(item.candidate.downloadUrl)
      if (!download) {
        download = fetchBuffer(item.candidate.downloadUrl)
        downloadCache.set(item.candidate.downloadUrl, download)
      }
      const input = await download
      await sharp(input)
        .rotate()
        .resize(1200, 800, { fit: "cover", position: "attention" })
        .webp({ quality: 82, effort: 4 })
        .toFile(filePath)
      await sleep(350)
      if ((index + 1) % 25 === 0 || index + 1 === resolved.length) {
        console.log(`  images ${index + 1}/${resolved.length}`)
      }
    })
  }

  const records: LocationImageRecord[] = resolved
    .map(({ target, candidate, pageTitle }) => {
      const { publicPath } = outputPath(target)
      const locationLabel =
        target.kind === "county" ? target.name : `${target.name}, ${target.countyName}`
      return {
        kind: target.kind,
        slug: target.slug,
        name: target.name,
        countySlug: target.countySlug,
        countyName: target.countyName,
        src: publicPath,
        alt:
          target.kind === "county"
            ? `${target.name}, California`
            : `${target.name} in ${target.countyName}, California`,
        attractionLabel: locationLabel,
        creator: candidate.creator,
        license: candidate.license,
        licenseUrl: candidate.licenseUrl,
        sourceUrl: candidate.sourceUrl,
        wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replaceAll(" ", "_"))}`,
        fileTitle: candidate.fileTitle,
      }
    })
    .sort(
      (a, b) =>
        a.kind.localeCompare(b.kind) ||
        a.countySlug.localeCompare(b.countySlug) ||
        a.name.localeCompare(b.name)
    )

  if (WRITE) {
    await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(records, null, 2)}\n`)
  } else {
    await fs.writeFile(
      "/tmp/california-location-image-plan.json",
      `${JSON.stringify(records, null, 2)}\n`
    )
  }

  const uniqueSources = new Set(records.map((record) => record.sourceUrl))
  console.log(
    JSON.stringify({
      targets: targets.length,
      counties: records.filter((record) => record.kind === "county").length,
      cities: records.filter((record) => record.kind === "city").length,
      uniqueSources: uniqueSources.size,
      write: WRITE,
      output: WRITE ? OUTPUT_JSON : "/tmp/california-location-image-plan.json",
    })
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
