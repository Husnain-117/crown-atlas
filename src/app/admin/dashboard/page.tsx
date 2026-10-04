import Link from 'next/link'
import { Building2, Database, MailCheck, Server, ShieldCheck } from 'lucide-react'

import { FROM_EMAIL, ADMIN_EMAILS } from '@/lib/email'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const services = [
    {
      label: 'Lead email delivery',
      value: process.env.RESEND_API_KEY ? 'Configured' : 'Missing RESEND_API_KEY',
      healthy: Boolean(process.env.RESEND_API_KEY),
      icon: MailCheck,
    },
    {
      label: 'Property database',
      value: hasPostgresConfiguration() ? 'Configured' : 'Database configuration missing',
      healthy: hasPostgresConfiguration(),
      icon: Database,
    },
    {
      label: 'Newsletter and comments',
      value: process.env.MONGODB_URI ? 'Configured' : 'MONGODB_URI missing',
      healthy: Boolean(process.env.MONGODB_URI),
      icon: Server,
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-600" size={26} aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Operations</h1>
            <p className="mt-1 text-sm text-slate-600">Current production routing and service configuration.</p>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white" aria-labelledby="lead-routing-heading">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="lead-routing-heading" className="text-base font-semibold text-slate-950">Lead routing</h2>
        </div>
        <dl className="divide-y divide-slate-100 text-sm">
          <StatusRow label="Destination" value={ADMIN_EMAILS.join(', ')} healthy />
          <StatusRow label="Sender" value={FROM_EMAIL} healthy={Boolean(process.env.RESEND_API_KEY)} />
          <StatusRow label="Storage" value="Email only - no CRM or lead database" healthy />
        </dl>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white" aria-labelledby="services-heading">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="services-heading" className="text-base font-semibold text-slate-950">Services</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {services.map(({ label, value, healthy, icon: Icon }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-4">
              <Icon className={healthy ? 'text-emerald-600' : 'text-amber-600'} size={20} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{label}</p>
                <p className="mt-0.5 text-sm text-slate-600">{value}</p>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${healthy ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-label={healthy ? 'Configured' : 'Needs attention'} />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/leads" className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          <MailCheck size={17} aria-hidden="true" />
          Lead routing
        </Link>
        <Link href="/admin/properties" className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50">
          <Building2 size={17} aria-hidden="true" />
          Properties
        </Link>
      </div>
    </div>
  )
}

function StatusRow({ label, value, healthy }: { label: string; value: string; healthy: boolean }) {
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr]">
      <dt className="font-medium text-slate-700">{label}</dt>
      <dd className={healthy ? 'min-w-0 break-words text-slate-900' : 'min-w-0 break-words text-amber-700'}>{value}</dd>
    </div>
  )
}

function hasPostgresConfiguration(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
    process.env.INSTANCE_CONNECTION_NAME ||
    (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER),
  )
}
