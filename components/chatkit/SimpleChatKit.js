'use client';

import { useState } from 'react';
import ChatKitPanel from './ChatKitPanel';

export default function SimpleChatKit({ config, ready }) {
  const [theme, setTheme] = useState('light');

  if (!ready) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        ChatKit is not ready yet. Confirm the backend is running and try again.
      </div>
    );
  }

  return (
    <div className="h-[540px] w-full">
      <ChatKitPanel config={config} theme={theme} onThemeChange={setTheme} />
    </div>
  );
}
