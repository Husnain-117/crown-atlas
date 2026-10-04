import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react'

import { FROM_EMAIL, ADMIN_EMAILS } from '@/lib/email'

export const dynamic = 'force-dynamic'

const routedForms = [
  'Global contact panel',
  'Property inquiries',
  'Tour requests',
  'Home valuation',
  'Financing inquiries',
  'Corporate relocation',
  'Saved searches',
  'Newsletter subscriptions',
  'Blog comments',
]

export default function LeadRoutingPage() {
  const resendConfigured = Boolean(process.env.RESEND_API_KEY)

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <Mail className="mt-0.5 text-slate-700" size={25} aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Lead routing</h1>
          <p className="mt-1 break-words text-sm text-slate-600">Website inquiries are delivered by Resend and are not stored in a CRM.</p>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className={resendConfigured ? 'text-emerald-600' : 'text-amber-600'} size={22} aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-slate-950">{resendConfigured ? 'Resend is configured' : 'Resend needs configuration'}</h2>
            <p className="mt-1 break-words text-sm text-slate-600">
              {resendConfigured ? `Every form is routed to ${ADMIN_EMAILS.join(', ')}.` : 'Add RESEND_API_KEY in Vercel before accepting live submissions.'}
            </p>
          </div>
        </div>
        <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-600">Destination</dt>
            <dd className="mt-1 break-words text-slate-950">{ADMIN_EMAILS.join(', ')}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600">Sender</dt>
            <dd className="mt-1 break-all text-slate-950">{FROM_EMAIL}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-950">Covered forms</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {routedForms.map((form) => (
            <li key={form} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="text-emerald-600" size={17} aria-hidden="true" />
              {form}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
