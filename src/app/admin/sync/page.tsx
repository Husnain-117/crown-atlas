import { getSyncMetrics, getSyncHistory, clearStuckJobs } from '@/lib/db/sync-repo';
import { revalidatePath } from 'next/cache';
import { AlertCircle, CheckCircle2, Clock, Activity, RefreshCw, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PostgresSyncPage() {
  const metrics = await getSyncMetrics();
  const history = await getSyncHistory(10);

  // Server Actions for Sync admin tasks
  async function triggerDeltaSync() {
    'use server';
    
    const secret = process.env.CRON_SECRET;
    const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    if (!secret) {
      console.error("Missing CRON_SECRET");
      return;
    }

    try {
      // Intentionally not awaiting this to not block the UI (it can take up to 5 min)
      fetch(`${url}/api/cron/mls-delta`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secret}`
        }
      }).catch(err => console.error("Sync trigger error:", err));
      
    } catch (e) {
      console.error("Failed to trigger sync:", e);
    }
    
    // Give it a second to mark as running
    await new Promise(r => setTimeout(r, 1000));
    revalidatePath('/admin/sync');
  }

  async function resetStuckJobs() {
    'use server';
    await clearStuckJobs('1 hour');
    revalidatePath('/admin/sync');
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Main Database Sync (PostgreSQL)</h1>
          <p className="text-slate-500 mt-2">Manage the live Trestle property feed to your primary Heroku/Postgres database.</p>
        </div>
        
        <div className="flex gap-4">
          {metrics.isRunning ? (
            <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-medium border">
              <RefreshCw className="animate-spin" size={18} />
              Sync Running...
            </button>
          ) : (
            <form action={triggerDeltaSync}>
              <button 
                type="submit" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm transition-all active:scale-95"
              >
                <RefreshCw size={18} />
                Trigger Delta Sync
              </button>
            </form>
          )}

          <form action={resetStuckJobs}>
            <button 
              type="submit" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 rounded-lg font-medium shadow-sm border transition-all active:scale-95"
            >
              <XCircle size={18} className="text-red-500" />
              Clear Stuck Jobs
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Last Success" 
          value={metrics.lastSuccess ? new Date(metrics.lastSuccess).toLocaleString() : 'Never'}
          icon={<CheckCircle2 size={24} className="text-emerald-500" />}
          description={metrics.lastSuccess && (Date.now() - new Date(metrics.lastSuccess).getTime() > 24 * 3600000) ? 
            <span className="text-red-500 font-medium">Over 24h ago! DB is stale.</span> : 
            <span className="text-emerald-600">Fresh</span>
          }
        />
        
        <MetricCard 
          title="Total Active" 
          value={metrics.totalActive.toLocaleString()}
          icon={<Building2 className="text-blue-500" size={24} />}
        />

        <MetricCard 
          title="Updated 24h" 
          value={metrics.recentlyUpdated.toLocaleString()}
          icon={<Activity className="text-purple-500" size={24} />}
          description="Recent changes."
        />

        <MetricCard 
          title="Stale (>30d)" 
          value={metrics.staleActive.toLocaleString()}
          icon={<Clock className="text-amber-500" size={24} />}
          description={metrics.staleActive > 1000 ? <span className="text-red-500 font-medium">Action Required!</span> : 'Expected'}
        />
      </div>

      <div className="mt-12 bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-5 border-b bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Recent Sync Jobs</h2>
          <span className="text-sm text-slate-500">Last 10 executions</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Started</th>
                <th className="px-6 py-3 font-medium">Completed</th>
                <th className="px-6 py-3 font-medium text-right">Fetched</th>
                <th className="px-6 py-3 font-medium text-right">Upserted</th>
                <th className="px-6 py-3 font-medium text-right">Failed</th>
                <th className="px-6 py-3 font-medium">Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length > 0 ? history.map(job => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(job.started_at).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {job.completed_at ? new Date(job.completed_at).toLocaleString(undefined, { 
                      hour: '2-digit', minute:'2-digit', second:'2-digit' 
                    }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums">{job.records_fetched}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-emerald-600 font-medium">{job.records_inserted}</td>
                  <td className="px-6 py-4 text-right tabular-nums">{job.records_failed > 0 ? <span className="text-red-500">{job.records_failed}</span> : 0}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {job.triggered_by}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No sync history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description?: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      {description && <div className="text-xs text-slate-500 mt-auto pt-2">{description}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    running: 'bg-blue-50 text-blue-700 border-blue-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 size={14} className="mr-1.5" />,
    running: <RefreshCw size={14} className="mr-1.5 animate-spin" />,
    failed: <XCircle size={14} className="mr-1.5" />,
    partial: <AlertCircle size={14} className="mr-1.5" />,
  };

  const css = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${css} capitalize`}>
      {icons[status] || null}
      {status}
    </span>
  );
}

// Ensure Building2 matches icon import
import { Building2 } from 'lucide-react';
