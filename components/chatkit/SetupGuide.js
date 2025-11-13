'use client';

import Link from 'next/link';

export default function SetupGuide() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Configure ChatKit
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Follow these steps to wire the frontend to your ChatKit-enabled backend.
      </p>
      <ol className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
        <li>
          1. Launch the ChatKit reference backend from the{' '}
          <Link
            href="https://github.com/openai/chatkit/tree/main/examples/chatkit-implementation/backend"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
          >
            chatkit-implementation repository
          </Link>{' '}
          or adapt your own service to expose the <code className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-800">/chatkit</code>{' '}
          endpoint.
        </li>
        <li>
          2. Copy <code className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-800">.env.example</code> to{' '}
          <code className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-800">.env.local</code> and update{' '}
          <code className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-800">CHATKIT_BACKEND_URL</code> so it points to your backend.
        </li>
        <li>
          3. Provide a domain key via{' '}
          <code className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-800">NEXT_PUBLIC_CHATKIT_API_DOMAIN_KEY</code> so ChatKit can validate requests in production.
        </li>
        <li>4. Restart the Next.js dev server after changing environment variables.</li>
      </ol>
    </div>
  );
}
