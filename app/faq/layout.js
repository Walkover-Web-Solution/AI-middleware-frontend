import FAQPage from "./page";

export const metadata = {
  title: "faq",
  description:
    "Find answers for all your questions relates to AI Middleware / GTWY AI right here",
  keywords:
    "gtwy ai, ai middleware, ai integration platform, ai chatbot service, openai integration, anthropic api, groq ai, o1 ai, ai automation tools, ai api gateway, large language model integration, llm api, ai software solutions, ai-powered chatbot, ai model deployment, machine learning api, enterprise ai solutions, ai infrastructure, artificial intelligence services, custom ai development, ai orchestration, ai cloud services, multi-ai platform, ai business solutions, ai developer tools, ai framework, gpt integration, ai tools for business, llm deployment, ai model hosting, ai tech stack, ai-powered applications, smart ai assistant, best ai middleware, chatbot development platform, ai-powered automation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body suppressHydrationWarning>
        <div className="flex">
          <div className="w-1/2">
            <FAQPage/>
          </div>
          <div className="w-1/2">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
