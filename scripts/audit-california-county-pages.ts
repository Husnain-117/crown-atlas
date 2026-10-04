import {
  CALIFORNIA_CITY_IMAGES,
  CALIFORNIA_COUNTY_IMAGES,
} from "../src/lib/california-location-images"
import { COUNTIES } from "../src/lib/counties"

const baseUrl = (process.env.AUDIT_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const citiesPerPage = 12
const failures: string[] = []
let pageCount = 0

async function checkCounty(county: (typeof COUNTIES)[number]): Promise<void> {
  const totalPages = Math.max(1, Math.ceil(county.cities.length / citiesPerPage))
  const sortedCities = [...county.cities].sort((a, b) => a.name.localeCompare(b.name))

  for (let page = 1; page <= totalPages; page += 1) {
    const pageCities = sortedCities.slice(
      (page - 1) * citiesPerPage,
      page * citiesPerPage
    )
    const response = await fetch(
      `${baseUrl}/buy/${county.slug}${page > 1 ? `?page=${page}` : ""}`
    )
    pageCount += 1
    if (!response.ok) {
      failures.push(`${county.slug} page ${page}: HTTP ${response.status}`)
      continue
    }

    const html = (await response.text()).replace(/%2f/gi, "/")
    const countyImage = CALIFORNIA_COUNTY_IMAGES[county.slug]
    if (!countyImage || !html.includes(countyImage.src)) {
      failures.push(`${county.slug} page ${page}: county hero is missing`)
    }

    for (const city of pageCities) {
      const cityImage = CALIFORNIA_CITY_IMAGES[city.slug]
      if (!html.includes(`/buy/${county.slug}/${city.slug}`)) {
        failures.push(`${county.slug} page ${page}: link missing for ${city.slug}`)
      }
      if (!cityImage || !html.includes(cityImage.src)) {
        failures.push(`${county.slug} page ${page}: image missing for ${city.slug}`)
      }
    }
  }

  const outOfRange = await fetch(`${baseUrl}/buy/${county.slug}?page=999`)
  const outOfRangeHtml = (await outOfRange.text()).replace(/%2f/gi, "/")
  const lastCity = sortedCities[sortedCities.length - 1]
  if (!outOfRange.ok || !outOfRangeHtml.includes(`/buy/${county.slug}/${lastCity.slug}`)) {
    failures.push(`${county.slug}: out-of-range pagination did not clamp`)
  }

  const apiResponse = await fetch(
    `${baseUrl}/api/counties-images?county=${encodeURIComponent(county.name)}`
  )
  if (!apiResponse.ok) {
    failures.push(`${county.slug}: image API returned HTTP ${apiResponse.status}`)
    return
  }
  const apiImages = (await apiResponse.json()) as Array<{ image_url?: string }>
  if (apiImages.length !== county.cities.length + 1) {
    failures.push(
      `${county.slug}: image API returned ${apiImages.length}, expected ${county.cities.length + 1}`
    )
  }
}

async function main(): Promise<void> {
  const queue = [...COUNTIES]
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length > 0) {
      const county = queue.shift()
      if (county) await checkCounty(county)
    }
  })
  await Promise.all(workers)

  if (failures.length > 0) {
    console.error(failures.join("\n"))
    process.exitCode = 1
    return
  }

  console.log(
    `County route audit passed: ${COUNTIES.length} counties, ${pageCount} paginated pages, ${COUNTIES.flatMap((county) => county.cities).length} cities and communities`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
