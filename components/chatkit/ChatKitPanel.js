'use client';

import { useMemo } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { CHATKIT_GREETING, CHATKIT_STARTER_PROMPTS, CHATKIT_PLACEHOLDER_INPUT } from '@/config/chatkit';

const COLOR_THEME = {
  light: {
    grayscale: { hue: 220, tint: 6, shade: -4 },
    accent: { primary: '#0f172a', level: 1 },
  },
  dark: {
    grayscale: { hue: 220, tint: 6, shade: -1 },
    accent: { primary: '#f1f5f9', level: 1 },
  },
};

export default function ChatKitPanel({
  config,
  theme = 'light',
  onThemeChange,
  onResponseEnd,
}) {
  if (!config?.api?.url) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        ChatKit API URL is not configured.
      </div>
    );
  }

  const themeConfig = useMemo(
    () => ({
      colorScheme: theme,
      color: COLOR_THEME[theme] ?? COLOR_THEME.light,
      radius: 'round',
    }),
    [theme]
  );

  const chatkit = useChatKit({
    api: { url: 'http://localhost:8000/chatkit', domainKey: 'domain_pk_localhost_dev' },
    theme: {
      colorScheme: theme,
      color: {
        grayscale: {
          hue: 220,
          tint: 6,
          shade: theme === "dark" ? -1 : -4,
        },
        accent: {
          primary: theme === "dark" ? "#f1f5f9" : "#0f172a",
          level: 1,
        },
      },
      radius: "round",
    },
    startScreen: {
      greeting: CHATKIT_GREETING,
      prompts: CHATKIT_STARTER_PROMPTS,
    },
    composer: {
      placeholder: CHATKIT_PLACEHOLDER_INPUT,
    },
    threadItemActions: {
      feedback: false,
    },
    onClientTool: async (invocation) => {
      if (invocation.name === "switch_theme") {
        const requested = invocation.params.theme;
        if (requested === "light" || requested === "dark") {
          if (import.meta.env.DEV) {
            console.debug("[ChatKitPanel] switch_theme", requested);
          }
          onThemeRequest(requested);
          return { success: true };
        }
        return { success: false };
      }

      if (invocation.name === "record_fact") {
        const id = String(invocation.params.fact_id ?? "");
        const text = String(invocation.params.fact_text ?? "");
        if (!id || processedFacts.current.has(id)) {
          return { success: true };
        }
        processedFacts.current.add(id);
        void onWidgetAction({
          type: "save",
          factId: id,
          factText: text.replace(/\s+/g, " ").trim(),
        });
        return { success: true };
      }

      return { success: false };
    },
    onResponseEnd: () => {
      onResponseEnd();
    },
    onThreadChange: () => {
      processedFacts.current.clear();
    },
    onError: ({ error }) => {
      // ChatKit handles displaying the error to the user
      console.error("ChatKit error", error);
    },
  });

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <ChatKit control={chatkit.control} className="block h-full w-full" />
    </div>
  );
}
