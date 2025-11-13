const CHATKIT_API_URL =
  process.env.NEXT_PUBLIC_CHATKIT_API_URL ?? "/api/chatkit";

const CHATKIT_API_DOMAIN_KEY =
  process.env.NEXT_PUBLIC_CHATKIT_API_DOMAIN_KEY ?? "domain_pk_localhost_dev";

const CHATKIT_GREETING = "Welcome to the ChatKit demo";

const CHATKIT_STARTER_PROMPTS = [
  {
    label: "What can you do?",
    prompt: "What can you do?",
    icon: "circle-question",
  },
  {
    label: "Tell me a fun fact",
    prompt: "Tell me a fun fact about technology.",
    icon: "book-open",
  },
  {
    label: "Switch to dark theme",
    prompt: "Switch the interface to dark mode.",
    icon: "sparkle",
  },
];

const CHATKIT_PLACEHOLDER_INPUT = "Ask the assistant anything…";

export {
  CHATKIT_API_URL,
  CHATKIT_API_DOMAIN_KEY,
  CHATKIT_GREETING,
  CHATKIT_STARTER_PROMPTS,
  CHATKIT_PLACEHOLDER_INPUT,
};
