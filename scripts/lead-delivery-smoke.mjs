const baseUrl = (
  process.env.LEAD_MONITOR_BASE_URL ||
  process.env.SMOKE_BASE_URL ||
  "https://crowncoastalhomes.com"
).replace(/\/+$/, "")

const secret = process.env.CRON_SECRET?.trim()
if (!secret) {
  throw new Error("CRON_SECRET is required for the lead delivery monitor")
}

async function runLeadDeliveryCheck() {
  const response = await fetch(`${baseUrl}/api/monitoring/lead-delivery`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ source: "digitalocean-droplet" }),
    signal: AbortSignal.timeout(30_000),
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || !payload.success) {
    throw new Error(
      `Production lead delivery check returned ${response.status}: ${
        payload.error || "unknown error"
      }`,
    )
  }

  console.log(JSON.stringify({
    ok: true,
    event: "lead_delivery_check",
    requestId: payload.requestId,
    checkedAt: payload.checkedAt,
    baseUrl,
  }))
}

async function sendFallbackAlert(error) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ||
        "Crown Coastal Homes <onboarding@resend.dev>",
      to: [
        process.env.LEAD_MONITOR_ALERT_EMAIL ||
          "djelveh.m@gmail.com",
      ],
      subject: "[Action required] Crown Coastal lead monitor failed",
      text: [
        "The automated production lead delivery check failed.",
        `Target: ${baseUrl}`,
        `Time: ${new Date().toISOString()}`,
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(20_000),
  })

  if (!response.ok) {
    console.error(`Fallback alert returned ${response.status}`)
  }
}

try {
  await runLeadDeliveryCheck()
} catch (error) {
  await sendFallbackAlert(error).catch((alertError) => {
    console.error(
      `Fallback alert failed: ${
        alertError instanceof Error ? alertError.message : String(alertError)
      }`,
    )
  })
  console.error(JSON.stringify({
    ok: false,
    event: "lead_delivery_check",
    error: error instanceof Error ? error.message : String(error),
    baseUrl,
  }))
  process.exitCode = 1
}
