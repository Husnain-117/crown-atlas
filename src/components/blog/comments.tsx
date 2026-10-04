"use client"
import { useEffect, useState } from 'react'

type Comment = { id: string; author_name: string | null; body: string; created_at: string }

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(j => { if (mounted) setComments(j.comments || []) })
      .catch(() => { if (mounted) setComments([]) })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [slug])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    setMsg(null)
    try {
      const res = await fetch('/api/comments', { method:'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ slug, author_name: author.trim() || 'Anonymous', body: body.trim() }) })
      const j = await res.json()
      if (!j.ok) throw new Error(j.error || 'Error')
      setBody('')
      setMsg('Thanks — your comment is pending moderation.')
    } catch (e: any) { setMsg(e.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Comments</h2>
      {loading ? <div className="text-sm text-slate-500">Loading…</div> : (
        comments.length ? (
          <ul className="space-y-3 mb-6">
            {comments.map(c => (
              <li key={c.id} className="border border-[var(--coastal-border)] rounded p-3 bg-[var(--surface)]">
                <div className="text-sm text-[var(--coastal-muted-text)] mb-1">{c.author_name || 'Anonymous'} • {new Date(c.created_at).toLocaleDateString()}</div>
                <div>{c.body}</div>
              </li>
            ))}
          </ul>
        ) : <div className="text-sm text-slate-500 mb-6">No comments yet. Be the first to comment.</div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Your name (optional)" className="w-full border border-[var(--coastal-border)] rounded px-3 py-2 bg-[var(--surface)] text-[var(--coastal-text)]" />
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Your comment" className="w-full border border-[var(--coastal-border)] rounded px-3 py-2 h-28 bg-[var(--surface)] text-[var(--coastal-text)]" required />
        <button disabled={submitting || !body.trim()} className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50">{submitting ? 'Sending…' : 'Submit Comment'}</button>
        {msg && <div className="text-sm text-[var(--coastal-muted-text)]">{msg}</div>}
      </form>
    </div>
  )
}
