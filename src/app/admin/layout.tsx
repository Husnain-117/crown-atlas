import Link from 'next/link'
import { Building2, LayoutDashboard, RefreshCw, Users } from 'lucide-react'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3 hover:opacity-80">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">CC</span>
            <div>
              <div className="font-semibold text-slate-950">Crown Coastal</div>
              <div className="text-xs text-slate-500">Operations</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex" aria-label="Admin navigation">
            <Link href="/admin/dashboard" className="text-slate-700 hover:text-slate-950">Dashboard</Link>
            <Link href="/admin/properties" className="text-slate-700 hover:text-slate-950">Properties</Link>
            <Link href="/admin/leads" className="text-slate-700 hover:text-slate-950">Lead routing</Link>
            <Link href="/" className="text-slate-500 hover:text-slate-800">Website</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 rounded-lg border border-slate-200 bg-white p-2" aria-label="Admin tools">
            <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={18} />}>Dashboard</NavItem>
            <NavItem href="/admin/properties" icon={<Building2 size={18} />}>Properties</NavItem>
            <NavItem href="/admin/leads" icon={<Users size={18} />}>Lead routing</NavItem>
            <NavItem href="/admin/sync" icon={<RefreshCw size={18} />}>MLS sync</NavItem>
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}

function NavItem({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950">
      <span className="text-slate-500">{icon}</span>
      <span>{children}</span>
    </Link>
  )
}
