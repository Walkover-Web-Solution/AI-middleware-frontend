'use client';

import { useState } from 'react';

const HEALTH_ENDPOINT = '/api/chatkit/health';

export default function ChatKitTest({ ready }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runTest = async () => {
    setRunning(true);
    try {
      const response = await fetch(HEALTH_ENDPOINT, { cache: 'no-store' });
      const payload = await response.json();
      setResult({
        ok: response.ok && Boolean(payload?.ok),
        detail: payload,
      });
    } catch (error) {
      setResult({
        ok: false,
        detail: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Quick backend check
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Run this to confirm the Next.js proxy can reach the ChatKit backend.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={runTest}
          disabled={running || !ready}
        >
          {running ? 'Checking…' : 'Run check'}
        </button>
      </div>
      {result && (
        <pre className="mt-4 max-h-56 overflow-auto rounded-md bg-slate-950/90 p-3 text-xs text-slate-100">
          {JSON.stringify(result.detail, null, 2)}
        </pre>
      )}
      {!ready && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          Provide environment variables and a reachable backend to enable this test.
        </p>
      )}
    </div>
  );
}
