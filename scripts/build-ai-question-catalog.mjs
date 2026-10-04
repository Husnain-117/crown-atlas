#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const outputPath = path.join(root, "data/seo/ai-question-catalog.json")
const checkOnly = process.argv.includes("--check")

const markets = [
  ["San Diego", "/buy/san-diego/san-diego-ca"],
  ["La Jolla", "/buy/san-diego/la-jolla-ca"],
  ["Del Mar", "/buy/san-diego/del-mar-ca"],
  ["Coronado", "/buy/san-diego/coronado-ca"],
  ["Carlsbad", "/buy/san-diego/carlsbad-ca"],
  ["Encinitas", "/buy/san-diego/encinitas-ca"],
  ["Los Angeles", "/buy/los-angeles/los-angeles-ca"],
  ["Beverly Hills", "/buy/los-angeles/beverly-hills-ca"],
  ["Santa Monica", "/buy/los-angeles/santa-monica-ca"],
  ["Malibu", "/buy/los-angeles/malibu-ca"],
  ["Newport Beach", "/buy/orange/newport-beach-ca"],
  ["Laguna Beach", "/buy/orange/laguna-beach-ca"],
  ["Irvine", "/buy/orange/irvine-ca"],
  ["San Francisco", "/buy/san-francisco/san-francisco-ca"],
  ["San Jose", "/buy/santa-clara/san-jose-ca"],
]

const topics = [
  { intent: "market", suffix: null, subject: "housing market", elements: ["active inventory", "median price", "days on market", "data date"] },
  { intent: "condo", suffix: "condos-for-sale", subject: "condos", elements: ["active condos", "HOA review", "ownership type", "data date"] },
  { intent: "luxury", suffix: "luxury-homes", subject: "luxury homes", elements: ["active inventory", "price range", "property-specific due diligence", "data date"] },
  { intent: "ocean_view", suffix: "ocean-view-homes", subject: "ocean-view homes", elements: ["view terminology", "active inventory", "insurance research", "data date"] },
  { intent: "pool", suffix: "homes-with-pool", subject: "homes with pools", elements: ["active inventory", "pool condition", "maintenance", "data date"] },
  { intent: "tax", suffix: null, subject: "property taxes", elements: ["county assessor source", "assessment caveat", "supplemental tax", "verification step"] },
  { intent: "insurance", suffix: null, subject: "home insurance", elements: ["property-specific quote", "hazard context", "coverage exclusions", "verification step"] },
  { intent: "schools", suffix: null, subject: "public schools", elements: ["official district source", "boundary caveat", "enrollment caveat", "verification step"] },
  { intent: "commute", suffix: null, subject: "commutes", elements: ["route-specific research", "time-of-day caveat", "transit source", "verification step"] },
  { intent: "hoa", suffix: "condos-for-sale", subject: "HOA costs", elements: ["dues", "reserves", "special assessments", "document review"] },
  { intent: "buying", suffix: null, subject: "buying a home", elements: ["financing", "inspection", "disclosures", "closing costs"] },
  { intent: "comparison", suffix: null, subject: "neighborhood comparisons", elements: ["inventory", "ownership costs", "official sources", "buyer priorities"] },
]

const templates = [
  (city, subject) => `What should I know about ${subject} in ${city}, California?`,
  (city, subject) => `How can I compare ${subject} in ${city} using current data?`,
  (city, subject) => `What are the biggest buyer considerations for ${subject} in ${city}?`,
  (city, subject) => `Which official sources should I check for ${subject} in ${city}?`,
  (city, subject) => `How have current conditions affected ${subject} in ${city}?`,
  (city, subject) => `What questions should I ask an agent about ${subject} in ${city}?`,
]

function facetTarget(base, suffix) {
  if (!suffix) return base
  const citySlug = base.split("/").at(-1).replace(/-ca$/, "")
  return `/california/${citySlug}/${suffix}`
}

function buildCatalog() {
  const combinations = []
  for (const topic of topics) {
    for (const template of templates) combinations.push({ topic, template })
  }

  const catalog = []
  let round = 0
  while (catalog.length < 1000) {
    for (const [city, base] of markets) {
      if (catalog.length >= 1000) break
      const combination = combinations[round % combinations.length]
      const question = combination.template(city, combination.topic.subject)
      catalog.push({
        id: `aiq-${String(catalog.length + 1).padStart(4, "0")}`,
        question,
        intent: combination.topic.intent,
        market: city,
        canonicalTarget: facetTarget(base, combination.topic.suffix),
        requiredAnswerElements: combination.topic.elements,
        requiredTrustSignals: ["named source", "visible update date", "reviewer", "methodology"],
        reviewCadence: combination.topic.intent === "market" ? "monthly" : "quarterly",
      })
    }
    round += 1
  }
  return catalog
}

function validateCatalog(catalog) {
  const errors = []
  if (catalog.length !== 1000) errors.push(`expected 1000 questions, found ${catalog.length}`)
  if (new Set(catalog.map((item) => item.question)).size !== catalog.length) errors.push("questions are not unique")
  if (new Set(catalog.map((item) => item.id)).size !== catalog.length) errors.push("IDs are not unique")
  if (catalog.some((item) => !/^\/(buy|california)\//.test(item.canonicalTarget))) errors.push("invalid canonical target")
  if (new Set(catalog.map((item) => item.market)).size !== markets.length) errors.push("not every priority market is represented")
  return errors
}

const expected = buildCatalog()
const errors = validateCatalog(expected)
if (errors.length) throw new Error(errors.join("; "))

if (checkOnly) {
  const current = JSON.parse(await fs.readFile(outputPath, "utf8"))
  const currentErrors = validateCatalog(current)
  if (currentErrors.length) throw new Error(currentErrors.join("; "))
  if (JSON.stringify(current) !== JSON.stringify(expected)) {
    throw new Error("AI question catalog is stale; run npm run seo:ai-catalog:build")
  }
  console.log(`AI question catalog valid: ${current.length} unique questions across ${markets.length} markets`)
} else {
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(expected, null, 2)}\n`, "utf8")
  console.log(`Wrote ${expected.length} AI benchmark questions to ${path.relative(root, outputPath)}`)
}
