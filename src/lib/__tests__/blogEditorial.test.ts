import assert from "node:assert/strict"
import { createBlogDraftReview, parseBlogDraft, requiresBlogFinancialReview, BLOG_PUBLICATION_WHERE } from "../blog-editorial"
import { blogSearchDestination, blogMarketSnapshot, blogImageUrl, blogDate, humanizeBlogLabel, serializeBlogJsonLd } from "../blog-presentation"

assert.equal(blogSearchDestination({ city: "San Diego", title: "California buying guide", slug: "guide" }).href, "/properties?city=San+Diego")
assert.equal(blogSearchDestination({ city: "Los Angeles", title: "Homes under $625k", slug: "homes" }).href, "/properties?city=Los+Angeles&maxPrice=625000")
assert.equal(blogSearchDestination({ title: "Homes below $1.5 million", slug: "homes" }).href, "/properties?maxPrice=1500000")
assert.equal(humanizeBlogLabel("first_time_buyers guide"), "first time buyers guide")
assert.equal(blogImageUrl("/placeholder.svg"), null)
assert.equal(blogImageUrl("javascript:alert(1)"), null)
assert.equal(blogImageUrl("https://images.example/home.jpg"), "https://images.example/home.jpg")
assert.equal(blogDate("bad"), null)
assert.equal(blogMarketSnapshot({ total_listings: 4, min_price: 500, median_price: 800, max_price: 700 }), null)
assert.equal(blogMarketSnapshot({ total_listings: 4, min_price: 500, median_price: 600, max_price: 700 })?.medianPrice, 600)
assert.equal(serializeBlogJsonLd({ text: "</script>" }).includes("<"), false)

assert.equal(createBlogDraftReview().status, "draft")
assert.equal(createBlogDraftReview().reviewed_by, null)
assert.throws(() => parseBlogDraft({ title: "Missing body" }))
assert.equal(requiresBlogFinancialReview({ title: "How to prepare a shortlist" }), false)
assert.equal(requiresBlogFinancialReview({ content: "Median asking price is $850,000." }), true)
assert.equal(requiresBlogFinancialReview({ content: "Expect 8% returns." }), true)
assert.equal(requiresBlogFinancialReview({ content: "Mortgage rates are falling." }), true)
const sourced = { editorial: { status: "published", reviewed_by: "Test reviewer", reviewed_at: "2026-09-06T00:00:00Z", sources: [{ url: "https://www.dre.ca.gov/", note: "Source checked" }] } }
assert.equal(requiresBlogFinancialReview({ content: "$850,000", data_snapshot: sourced }), false)
assert.equal(requiresBlogFinancialReview({ content: "$850,000", data_snapshot: { editorial: { status: "published" } } }), true)
assert.match(BLOG_PUBLICATION_WHERE, /reviewed_by/)
assert.match(BLOG_PUBLICATION_WHERE, /jsonb_array_length/)
console.log("blogEditorial: all assertions passed")
