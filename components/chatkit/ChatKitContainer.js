'use client';

import BackendStatus from './BackendStatus';
import ChatKitDemo from './ChatKitDemo';
import SetupGuide from './SetupGuide';
import { useChatKitIntegration } from '@/customHooks/useChatKitIntegration';

export default function ChatKitContainer() {
  const { isConfigured, loading, health, refreshHealth, config } =
    useChatKitIntegration();

  const ready = isConfigured && Boolean(health?.ok);

  return (
    <div className="space-y-6">
      <BackendStatus loading={loading} health={health} onRetry={refreshHealth} />
      {!isConfigured && <SetupGuide />}
      <ChatKitDemo config={config} ready={ready} />
    </div>
  );
}
