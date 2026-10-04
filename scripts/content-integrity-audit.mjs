import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const sourceRoots = ["src/app", "src/components"]
const supportedExtensions = new Set([".ts", ".tsx"])
const excludedPaths = [
  `${path.sep}admin${path.sep}`,
  `${path.sep}api${path.sep}`,
  `${path.sep}__tests__${path.sep}`,
]

const rules = [
  ["unfinished public copy", /coming soon\s*-|currently under development|chart placeholder/gi],
  ["nonfunctional form handler", /onSubmit=\{\(e\)\s*=>\s*e\.preventDefault\(\)\}/g],
  ["dead scheduling anchor", /href=["']#schedule["']/g],
  ["unverified response-time promise", /schedule tours in 24 hours|available 24\/7|within 2 hours/gi],
  ["unverified inventory promise", /access off-market listings/gi],
  ["absolute privacy promise", /100% privacy guaranteed/gi],
  ["fair-housing-sensitive marketing", /top-rated schools|safe neighborhoods|family-friendly/gi],
  ["unsupported superlative", /most desirable|premier boutique|premier luxury real estate/gi],
  ["placeholder contact data", /\+1-XXX-XXX-XXXX|\(555\) 123-4567/gi],
]

const files = (
  await Promise.all(sourceRoots.map((sourceRoot) => collectFiles(path.join(root, sourceRoot))))
).flat()

const findings = []

for (const file of files) {
  const content = await readFile(file, "utf8")

  for (const [label, expression] of rules) {
    const regex = new RegExp(expression.source, expression.flags)
    for (const match of content.matchAll(regex)) {
      const line = content.slice(0, match.index).split("\n").length
      findings.push(`${path.relative(root, file)}:${line}: ${label}: ${JSON.stringify(match[0])}`)
    }
  }
}

if (findings.length > 0) {
  console.error(`Content integrity audit failed with ${findings.length} finding(s):`)
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log(`Content integrity audit passed (${files.length} public source files checked).`)

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (excludedPaths.some((part) => fullPath.includes(part))) continue

    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath))
    } else if (supportedExtensions.has(path.extname(entry.name)) && !entry.name.includes(".test.")) {
      files.push(fullPath)
    }
  }

  return files
}
