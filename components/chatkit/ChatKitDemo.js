'use client';

import ChatKitTest from './ChatKitTest';
import SimpleChatKit from './SimpleChatKit';

export default function ChatKitDemo({ config, ready }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          ChatKit preview
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          This embeds the official ChatKit React component configured to talk to your backend. Use it as a reference when wiring ChatKit into other areas of the app.
        </p>
      </div>
      <SimpleChatKit config={config} ready={ready} />
      <ChatKitTest ready={ready} />
    </div>
  );
}
