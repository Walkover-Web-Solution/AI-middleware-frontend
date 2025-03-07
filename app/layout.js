import { Syne } from "next/font/google";


import "./globals.css";
import Wrapper from "@/wrapper/Wrapper";

const inter = Syne({ subsets: ["latin"] });

export const metadata = {
  title: "GTWY AI",
  description: "Simplified AI & chatbot integration",
  keywords:
    "ai middleware, ai integration platform, ai chatbot service, openai integration, anthropic api, groq ai, o1 ai, ai automation tools, ai api gateway, large language model integration, llm api, ai software solutions, ai-powered chatbot, ai model deployment, machine learning api, enterprise ai solutions, ai infrastructure, artificial intelligence services, custom ai development, ai orchestration, ai cloud services, multi-ai platform, ai business solutions, ai developer tools, ai framework, gpt integration, ai tools for business, llm deployment, ai model hosting, ai tech stack, ai-powered applications, smart ai assistant, best ai middleware, chatbot development platform, ai-powered automation",
};



export default function RootLayout({ children }) {
  return (

    <html lang="en" data-theme="light">

      <body suppressHydrationWarning>
        <Wrapper>
          {children}
        </Wrapper>
      </body>
    </html>
  );
}

