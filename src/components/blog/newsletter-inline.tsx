"use client"
import { useRef, useState } from 'react'
import Link from 'next/link'

export default function NewsletterInline({
  city,
  source = 'blog',
  title = 'Get local market insights',
}: {
  city?: string | null
  source?: string
  title?: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'ok'|'err'|'loading'>('idle')
  const [msg, setMsg] = useState<string | null>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const emailOk = /.+@.+\..+/.test(email)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!emailOk) return
    setStatus('loading')
    setMsg(null)
    try {
      const mongoRes = await fetch('/api/subscribers', { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({
          email,
          source,
          city,
          company: honeypotRef.current?.value || '',
        }),
      })
      const mongoData = await mongoRes.json()
      
      if (!mongoRes.ok || !mongoData.success) {
        throw new Error(mongoData.error || 'Error')
      }

      setStatus('ok')
      setMsg(mongoData.alreadySubscribed 
        ? 'You\'re already subscribed!' 
        : 'Subscribed. Welcome aboard!')
      setEmail('')
    } catch (error) {
      setStatus('err')
      setMsg(error instanceof Error ? error.message : 'Unable to subscribe. Please try again.')
    }
  }

  return (
    <div className="border border-[var(--coastal-border)] rounded-lg p-4 bg-[var(--surface-muted)]">
      <div className="font-semibold mb-2">{title}</div>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <div className="sr-only" aria-hidden="true">
          <label htmlFor={`newsletter-company-${source}`}>Company</label>
          <input ref={honeypotRef} id={`newsletter-company-${source}`} tabIndex={-1} autoComplete="off" />
        </div>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          aria-label="Email address"
          placeholder="you@example.com"
          className="h-11 min-w-0 flex-1 border border-[var(--coastal-border)] rounded px-3 bg-[var(--surface)] text-[var(--coastal-text)]"
          required
        />
        <button
          type="submit"
          disabled={!emailOk || status === 'loading'}
          className="min-h-11 px-4 py-2 bg-[var(--coastal-primary)] text-white rounded disabled:opacity-50"
        >
          {status === 'loading' ? 'Joining...' : 'Join Newsletter'}
        </button>
      </form>
      <p className="mt-2 text-xs text-[var(--coastal-muted-text)]">
        By subscribing you agree to our <Link href="/privacy" className="text-[var(--coastal-primary)] hover:underline font-medium">Privacy Policy</Link>. Unsubscribe anytime.
      </p>
      {msg && (
        <div
          className={`text-sm mt-2 ${status === 'err' ? 'text-red-600 dark:text-red-400' : 'text-[var(--coastal-muted-text)]'}`}
          role={status === 'err' ? 'alert' : 'status'}
        >
          {msg}
        </div>
      )}
    </div>
  )
}
