import assert from "node:assert/strict"
import { buildListingSchema } from "../seo/listing-schema"
import { schemaDate, schemaImageUrls } from "../seo/schema-values"
import { CONTACT } from "../constants/contact"
import { SITE_SCHEMA_IDS } from "../seo/site-schema"
import { getCoreSiteGraph } from "../seo/site-schema"
import { generateLocalBusinessSchema, generateRealEstateAgentSchema } from "../utils/seo"
import { buildMetadataTitle, truncateMetadataText } from "../seo/meta"

type SchemaNode = Record<string, unknown>

const coreGraph = getCoreSiteGraph() as SchemaNode[]
const coreJson = JSON.stringify(coreGraph)
const localBusiness = findNode(coreGraph, SITE_SCHEMA_IDS.localBusiness)
const agent = findNode(coreGraph, SITE_SCHEMA_IDS.agent)

assert.ok(localBusiness, "Core graph must include the real estate business")
assert.equal(localBusiness["@type"], "RealEstateAgent")
assert.equal(localBusiness.telephone, CONTACT.phone.href.replace(/^tel:/, ""))
assert.equal(localBusiness.email, CONTACT.email.display)
assert.equal(asRecord(localBusiness.address).addressLocality, CONTACT.business.fullAddress.city)

assert.ok(agent, "Core graph must include the licensed agent")
assert.equal(agent["@type"], "Person")
assert.equal(agent.name, CONTACT.agent.name)
assert.equal(asRecord(agent.identifier).value, CONTACT.agent.dre)
assert.equal(asRecord(agent.worksFor)["@id"], SITE_SCHEMA_IDS.localBusiness)

assert.equal(coreJson.includes("aggregateRating"), false)
assert.equal(coreJson.includes('"review"'), false)

const cityBusiness = generateLocalBusinessSchema("beverly hills", "ca") as SchemaNode
assert.equal(cityBusiness["@id"], SITE_SCHEMA_IDS.localBusiness)
assert.equal(cityBusiness.telephone, CONTACT.phone.href.replace(/^tel:/, ""))
assert.equal(cityBusiness.email, CONTACT.email.display)
assert.equal(asRecord(cityBusiness.address).addressLocality, CONTACT.business.fullAddress.city)
assert.equal(asRecord(cityBusiness.areaServed).name, "Beverly Hills")
assert.equal(asRecord(asRecord(cityBusiness.areaServed).containedInPlace).name, "California")

const pageAgent = generateRealEstateAgentSchema() as SchemaNode
assert.equal(pageAgent["@type"], "Person")
assert.equal(pageAgent["@id"], SITE_SCHEMA_IDS.agent)
assert.equal(pageAgent.name, CONTACT.agent.name)
assert.equal(asRecord(pageAgent.identifier).value, CONTACT.agent.dre)

const generatedJson = JSON.stringify([cityBusiness, pageAgent])
assert.equal(generatedJson.includes("+1-XXX"), false)
assert.equal(generatedJson.includes("contact@crowncoastalhomes.com"), true)

assert.equal(
  buildMetadataTitle("Short page title", "Crown Coastal Homes", 65),
  "Short page title | Crown Coastal Homes",
)
assert.equal(
  buildMetadataTitle("A descriptive title that already fills the available search result width", "Crown Coastal Homes", 65).length <= 65,
  true,
)
assert.equal(truncateMetadataText("word ".repeat(80), 160).length <= 160, true)

const listing = buildListingSchema({
  listing_key: "1179224081",
  address: "939 Coast Blvd. Unit 103",
  city: "La Jolla",
  images: ["/api/media?listingKey=1179224081&object=1", "https://images.example.com/home.jpg"],
  listing_contract_date: "Thu Aug 06 2026 00:00:00 GMT+0000 (Coordinated Universal Time)",
  updated_at: new Date("2026-08-26T03:00:25Z"),
})
assert.equal(listing.datePosted, "2026-08-06T00:00:00.000Z")
assert.equal(listing.dateModified, "2026-08-26T03:00:25.000Z")
assert.deepEqual(listing.image, [
  "https://crowncoastalhomes.com/api/media?listingKey=1179224081&object=1",
  "https://images.example.com/home.jpg",
])
assert.equal(schemaDate("not-a-date"), undefined)
assert.equal(schemaDate(new Date("invalid")), undefined)
assert.deepEqual(schemaImageUrls(["data:image/png;base64,abc", "javascript:alert(1)", "", "/home.jpg", "/home.jpg"]), ["https://crowncoastalhomes.com/home.jpg"])
const missingDates = buildListingSchema({ listing_key: "1179224081", address: "Test", updated_at: "invalid" })
assert.equal(Object.prototype.hasOwnProperty.call(missingDates, "dateModified"), false)
assert.equal(Object.prototype.hasOwnProperty.call(missingDates, "datePosted"), false)

console.log("seoSchema: all assertions passed")

function findNode(graph: SchemaNode[], id: string): SchemaNode {
  return graph.find((node) => node["@id"] === id) || {}
}

function asRecord(value: unknown): SchemaNode {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as SchemaNode
    : {}
}
