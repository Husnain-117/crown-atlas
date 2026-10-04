import assert from "node:assert/strict"
import { authorizeAdminPageRequest } from "../admin-page-auth"

const request = (authorization?: string) => new Request("https://example.test/admin", {
  headers: authorization ? { authorization } : undefined,
})
const basic = (value: string) => `Basic ${btoa(value)}`
const environment = {
  ADMIN_BASIC_USERNAME: "admin",
  ADMIN_BASIC_PASSWORD: "strong:password",
}

assert.deepEqual(authorizeAdminPageRequest(request(), {}), {
  configured: false,
  basicConfigured: false,
  authorized: false,
})
assert.equal(authorizeAdminPageRequest(request(), environment).authorized, false)
assert.equal(
  authorizeAdminPageRequest(request(basic("admin:strong:password")), environment).authorized,
  true,
)
assert.equal(
  authorizeAdminPageRequest(request(basic("admin:wrong")), environment).authorized,
  false,
)
assert.equal(
  authorizeAdminPageRequest(request("Basic not-base64!"), environment).authorized,
  false,
)
assert.equal(
  authorizeAdminPageRequest(request("Bearer api-secret"), {
    ADMIN_API_SECRET: "api-secret",
  }).authorized,
  true,
)

console.log("adminPageAuth: all assertions passed")
