import { mkdir, readdir, rename, rm, stat } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const root = path.resolve(process.cwd(), "public")
const write = process.argv.includes("--write")
const thresholdBytes = 500 * 1024
const maxDimension = 2400
const supported = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"])

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectFiles(fullPath)
    if (!entry.isFile() || !supported.has(path.extname(entry.name).toLowerCase())) return []
    return [fullPath]
  }))
  return nested.flat()
}

function configureOutput(pipeline, extension) {
  if (extension === ".jpg" || extension === ".jpeg") {
    return pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true })
  }
  if (extension === ".png") {
    return pipeline.png({ compressionLevel: 9, quality: 82, effort: 6 })
  }
  if (extension === ".webp") return pipeline.webp({ quality: 82, effort: 5 })
  return pipeline.avif({ quality: 55, effort: 5 })
}

const files = await collectFiles(root)
let candidates = 0
let optimized = 0
let originalBytes = 0
let outputBytes = 0
const tempDirectory = path.join(root, `.image-optimization-${process.pid}`)

await mkdir(tempDirectory, { recursive: true })

try {
  for (const file of files) {
    const source = await stat(file)
    if (source.size < thresholdBytes) continue

    const metadata = await sharp(file, { animated: true }).metadata()
    if ((metadata.pages ?? 1) > 1) continue

    candidates += 1
    const extension = path.extname(file).toLowerCase()
    const temp = path.join(tempDirectory, `${candidates}${extension}`)
    let pipeline = sharp(file).rotate()
    if ((metadata.width ?? 0) > maxDimension || (metadata.height ?? 0) > maxDimension) {
      pipeline = pipeline.resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
    }

    await configureOutput(pipeline, extension).toFile(temp)
    const result = await stat(temp)

    if (result.size < source.size * 0.9) {
      optimized += 1
      originalBytes += source.size
      outputBytes += result.size
      if (write) await rename(temp, file)
    }

    await rm(temp, { force: true })
    if (candidates % 20 === 0) console.log(`Checked ${candidates} large images...`)
  }
} finally {
  await rm(tempDirectory, { recursive: true, force: true })
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1)
console.log(`${write ? "Optimized" : "Would optimize"} ${optimized} of ${candidates} large images.`)
console.log(`Selected assets: ${mb(originalBytes)} MB -> ${mb(outputBytes)} MB (${mb(originalBytes - outputBytes)} MB saved).`)
