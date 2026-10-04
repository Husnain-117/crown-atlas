import assert from "node:assert/strict"
import { parsePropertyFaqs } from "../property-faqs"
import { derivePropertyDetailContent } from "../../app/properties/property/[id]/property-detail-content"

assert.deepEqual(parsePropertyFaqs(undefined), [])
assert.deepEqual(parsePropertyFaqs("not-json"), [])
assert.deepEqual(parsePropertyFaqs('{"question":"No array"}'), [])
assert.deepEqual(
  parsePropertyFaqs(JSON.stringify([
    { question: "Is it available?", answer: "Contact us for current status." },
    { question: "", answer: "Missing question" },
    { question: "Missing answer" },
  ])),
  [{ question: "Is it available?", answer: "Contact us for current status." }],
)

const inactiveFaqs = derivePropertyDetailContent({
  address: "123 History Lane",
  city: "San Diego",
  standard_status: "Closed",
  list_price: 750000,
  price_history: [],
} as any).faqs
const inactiveViewingFaq = inactiveFaqs.find((faq) => /schedule a viewing/i.test(faq.question))
assert.ok(inactiveViewingFaq)
assert.match(inactiveViewingFaq.answer, /cannot be booked/i)
assert.doesNotMatch(inactiveViewingFaq.answer, /Book Visit/i)

const activeFaqs = derivePropertyDetailContent({
  address: "456 Active Avenue",
  city: "San Diego",
  standard_status: "Active",
  list_price: 900000,
  price_history: [],
} as any).faqs
const activeViewingFaq = activeFaqs.find((faq) => /schedule a viewing/i.test(faq.question))
assert.ok(activeViewingFaq)
assert.match(activeViewingFaq.answer, /Book Visit/i)

console.log("propertyFaqs: all assertions passed")
