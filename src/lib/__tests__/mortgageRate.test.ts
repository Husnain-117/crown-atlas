import assert from "node:assert/strict"
import { getFallbackMortgageRate, parseFredCsv } from "../mortgage-rate"

const timestamp = Date.UTC(2026, 6, 14, 12, 0, 0)

assert.deepEqual(getFallbackMortgageRate("6.875", timestamp), {
  rate: 6.875,
  date: "2026-07-14",
  cachedAt: timestamp,
  source: "Fallback estimate",
})

assert.equal(getFallbackMortgageRate("not-a-rate", timestamp).rate, 6.5)
assert.equal(getFallbackMortgageRate("1.5", timestamp).rate, 6.5)
assert.equal(getFallbackMortgageRate("18", timestamp).rate, 6.5)

assert.deepEqual(
  parseFredCsv(
    "observation_date,MORTGAGE30US\n2026-07-09,6.49\n2026-07-16,6.55\n",
    timestamp
  ),
  {
    rate: 6.55,
    date: "2026-07-16",
    cachedAt: timestamp,
    source: "FRED/MORTGAGE30US",
  }
)
assert.equal(parseFredCsv("observation_date,MORTGAGE30US\n2026-07-16,.\n"), null)

console.log("mortgageRate: all assertions passed")
