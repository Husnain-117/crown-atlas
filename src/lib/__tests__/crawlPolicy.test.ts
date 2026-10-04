import assert from "node:assert/strict"
import robots from "../../app/robots"
import nextConfig from "../../../next.config"
import { CANADA_CAMPAIGN_PATHS, CANADA_LIFESTYLE_IMAGE } from "../canada-campaign-seo"

const { match } = require("next/dist/compiled/path-to-regexp") as {
  match: (path: string) => (pathname: string) => unknown
}

function list(value: string | string[] | undefined): string[] {
  return value == null ? [] : Array.isArray(value) ? value : [value]
}

// Evaluate the published rules using longest-match precedence and Allow ties.
function canCrawl(userAgent: string, path: string): boolean {
  const rules = robots().rules
  const groups = Array.isArray(rules) ? rules : [rules]
  const specific = groups.filter(group => list(group.userAgent).some(agent => agent.toLowerCase() === userAgent.toLowerCase()))
  const selected = specific.length ? specific : groups.filter(group => list(group.userAgent).includes("*"))
  const matches = selected.flatMap(group => [
    ...list(group.allow).map(rule => ({ rule, allow: true })),
    ...list(group.disallow).map(rule => ({ rule, allow: false })),
  ]).filter(({ rule }) => {
    const end = rule.endsWith("$")
    const body = end ? rule.slice(0, -1) : rule
    const regex = body.split("*").map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")
    return new RegExp(`^${regex}${end ? "$" : ""}`).test(path)
  }).sort((a, b) => b.rule.replace(/[*$]/g, "").length - a.rule.replace(/[*$]/g, "").length || Number(b.allow) - Number(a.allow))
  return matches[0]?.allow ?? true
}

async function headerFor(path: string) {
  const headers = await nextConfig.headers!()
  let robotsHeader: string | undefined
  for (const entry of headers) {
    if (!match(entry.source)(path)) continue
    const value = entry.headers.find(header => header.key.toLowerCase() === "x-robots-tag")?.value
    if (value) robotsHeader = value
  }
  return robotsHeader
}

async function run() {
  const previous = { VERCEL: process.env.VERCEL, VERCEL_ENV: process.env.VERCEL_ENV }
  try {
    process.env.VERCEL = "1"
    process.env.VERCEL_ENV = "production"
    for (const bot of ["Googlebot", "Googlebot-Image", "OAI-SearchBot", "Bingbot", "GPTBot", "PerplexityBot", "Claude-SearchBot"]) {
      for (const path of [...CANADA_CAMPAIGN_PATHS, CANADA_LIFESTYLE_IMAGE, ...['clients-kaushal-mobile', 'clients-jacobo', 'clients-jacobo-mobile', 'laguna-beach-coast', 'laguna-beach-coast-mobile'].map(name => `/images/canada/${name}.webp`)]) {
        assert.equal(canCrawl(bot, path), true, `${bot}: Canadian buyer content and imagery remain crawlable`)
      }
      for (const image of [
        "/_next/image?url=%2Fapi%2Fmedia%3FlistingKey%3D1179224081%26object%3D1&w=1920&q=75",
        "/_next/image?url=%2Flogo.png&w=640&q=75",
        "/api/media?listingKey=1179224081&object=1",
        "/api/og?city=La+Jolla&landing=Luxury+Homes&tag=California",
      ]) assert.equal(canCrawl(bot, image), true, `${bot}: public image must be crawlable: ${image}`)
      for (const privatePath of ["/api/admin/users", "/api/auth/session", "/api/contact", "/api/media/private", "/api/og-debug", "/dashboard", "/properties?minPrice=2000000&beds=3"]) {
        assert.equal(canCrawl(bot, privatePath), false, `${bot}: private/filter path must stay blocked: ${privatePath}`)
      }
    }
    assert.equal(await headerFor("/api/media"), "index, follow")
    assert.equal(await headerFor("/api/og"), "index, follow")
    for (const path of CANADA_CAMPAIGN_PATHS) assert.doesNotMatch(await headerFor(path) ?? "", /noindex/, path)
    for (const path of ["/api/admin/users", "/api/auth/session", "/api/contact", "/api/media/private", "/api/og-debug", "/admin"]) {
      assert.equal(await headerFor(path), "noindex, nofollow", path)
    }
    process.env.VERCEL_ENV = "preview"
    assert.equal(canCrawl("Googlebot", "/"), false)
    for (const path of CANADA_CAMPAIGN_PATHS) assert.equal(canCrawl("OAI-SearchBot", path), false, "preview campaigns stay blocked")
    assert.equal(canCrawl("Googlebot-Image", "/api/media?listingKey=1&object=1"), false)
    assert.equal(await headerFor("/api/media"), "noindex, nofollow")
    assert.equal(robots().sitemap, undefined)
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
  console.log("crawl policy: public images, private APIs and preview isolation passed")
}
void run().catch(error => { console.error(error); process.exitCode = 1 })
