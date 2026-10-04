import assert from "node:assert/strict"

import { POST } from "../../app/api/corporate-inquiry/route"
import { escapeCorporateInquiryHtml } from "../corporate-inquiry"

async function main() {
  assert.equal(
    escapeCorporateInquiryHtml('<img src=x onerror="alert(1)"> & test'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; test",
  )

  const malformedResponse = await POST(requestWith({ hrEmail: "not-an-email" }))
  assert.equal(malformedResponse.status, 400)

  const botResponse = await POST(requestWith({ website: "spam.example" }))
  assert.equal(botResponse.status, 200)
  assert.equal((await botResponse.json()).success, true)

  const originalResendKey = process.env.RESEND_API_KEY
  delete process.env.RESEND_API_KEY

  try {
    const unavailableResponse = await POST(requestWith({
      companyName: "Acme Corporation",
      hrContactName: "Jane Smith",
      hrEmail: "jane@acme.example",
      __top: 1500,
    }))
    assert.equal(unavailableResponse.status, 503)
    assert.equal((await unavailableResponse.json()).success, false)
  } finally {
    if (originalResendKey) process.env.RESEND_API_KEY = originalResendKey
  }

  console.log("corporateInquiry: all assertions passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

function requestWith(body: Record<string, unknown>): Request {
  return new Request("https://crowncoastalhomes.com/api/corporate-inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
