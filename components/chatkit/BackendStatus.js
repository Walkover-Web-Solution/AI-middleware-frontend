'use client';

export default function BackendStatus({ loading, health, onRetry }) {
  const { ok, status, message } = health ?? {};

  const statusColor = ok
    ? 'text-emerald-600'
    : status === 'unknown' || loading
      ? 'text-slate-500'
      : 'text-rose-600';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-wide ${statusColor}`}>
            ChatKit backend {loading ? 'checking…' : ok ? 'ready' : 'unavailable'}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {loading ? 'Running health check…' : message || 'No additional details.'}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={onRetry}
          disabled={loading}
        >
          {loading ? 'Checking…' : 'Retry'}
        </button>
      </div>
    </div>
  );
}
