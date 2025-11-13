'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CHATKIT_API_URL,
  CHATKIT_API_DOMAIN_KEY,
  CHATKIT_GREETING,
  CHATKIT_STARTER_PROMPTS,
  CHATKIT_PLACEHOLDER_INPUT,
} from '../config/chatkit';

const HEALTH_ENDPOINT = '/api/chatkit/health';

function createConfig() {
  return {
    api: {
      url: 'http://localhost:8000/chatkit',
      domainKey: 'domain_pk_localhost_dev',
    },
    startScreen: {
      greeting: CHATKIT_GREETING,
      prompts: CHATKIT_STARTER_PROMPTS,
    },
    composer: {
      placeholder: CHATKIT_PLACEHOLDER_INPUT,
    },
  };
}

export function useChatKitIntegration() {
  const [health, setHealth] = useState({
    ok: false,
    status: 'unknown',
    message: 'Checking backend status…',
  });
  const [loading, setLoading] = useState(true);

  const isConfigured = Boolean('http://localhost:8000/chatkit') && Boolean('domain_pk_localhost_dev');

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(HEALTH_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Health check failed with status ${response.status}`);
      }
      const payload = await response.json();
      setHealth({
        ok: Boolean(payload?.ok),
        status: payload?.status ?? 'unknown',
        message: payload?.message ?? '',
      });
    } catch (error) {
      console.error('ChatKit health check error', error);
      setHealth({
        ok: false,
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to reach ChatKit backend.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  const config = useMemo(() => createConfig(), []);

  return {
    isConfigured,
    loading,
    health,
    refreshHealth: fetchHealth,
    config,
  };
}
