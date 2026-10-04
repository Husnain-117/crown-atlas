import type { Metadata } from "next"
import Link from "next/link"
import { AlertCircle, CheckCircle, Home } from "lucide-react"

export const metadata: Metadata = {
  title: "Email Preferences | Crown Coastal Homes",
  robots: { index: false, follow: false },
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; scope?: string; token?: string }>
}) {
  const { status, scope, token } = await searchParams
  if (token && !status) {
    return (
      <main className="min-h-[70vh] bg-[var(--bg)] px-4 pt-32 pb-20">
        <section className="mx-auto max-w-xl rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[var(--coastal-text)] mb-3">Unsubscribe from market emails?</h1>
          <p className="text-[var(--coastal-muted-text)] mb-7">
            Confirm below to stop newsletter and market-update emails for this subscription.
          </p>
          <form action="/api/newsletter/unsubscribe" method="post">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--coastal-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
            >
              Confirm unsubscribe
            </button>
          </form>
        </section>
      </main>
    )
  }

  const success = status === "success"
  const title = success ? "Email preference updated" : "We could not update that link"
  const message = success
    ? scope === "alerts"
      ? "Property alert emails for this saved search have been stopped."
      : "This email address has been unsubscribed from newsletter and market-update emails."
    : status === "error"
      ? "A service error prevented the update. Please try the link again later or contact us."
      : "This unsubscribe link is missing, invalid, or no longer active."

  return (
    <main className="min-h-[70vh] bg-[var(--bg)] px-4 pt-32 pb-20">
      <section className="mx-auto max-w-xl rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-8 text-center shadow-sm">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${success ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {success ? <CheckCircle className="h-7 w-7" aria-hidden /> : <AlertCircle className="h-7 w-7" aria-hidden />}
        </div>
        <h1 className="text-2xl font-bold text-[var(--coastal-text)] mb-3">{title}</h1>
        <p className="text-[var(--coastal-muted-text)] mb-7">{message}</p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--coastal-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
        >
          <Home className="h-4 w-4" aria-hidden />
          Return home
        </Link>
      </section>
    </main>
  )
}
