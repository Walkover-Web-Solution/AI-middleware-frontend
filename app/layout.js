import { Syne } from "next/font/google";
import "./globals.css";
import "../styles/performance-optimizations.css";
import Wrapper from "@/wrapper/Wrapper";
import Head from "next/head";
import Script from "next/script";

const inter = Syne({ subsets: ["latin"] });

export const metadata = {
  title: "GTWY AI | Connect 5000+ apps in just 1 click",
  description: "Simplified AI & chatbot integration",
  category: 'technology',
  generator: 'GTWY AI',
  keywords: "gtwy ai, ai middleware, ai integration platform, ai chatbot service, openai integration, anthropic api, groq ai, o1 ai, ai automation tools, ai api gateway, large language model integration, llm api, ai software solutions, ai-powered chatbot, ai model deployment, machine learning api, enterprise ai solutions, ai infrastructure, artificial intelligence services, custom ai development, ai orchestration, ai cloud services, multi-ai platform, ai business solutions, ai developer tools, ai framework, gpt integration, ai tools for business, llm deployment, ai model hosting, ai tech stack, ai-powered applications, smart ai assistant, best ai middleware, chatbot development platform, ai-powered automation",
};

export const runtime = 'edge';

export default async function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <Head>
        <link rel="canonical" href="https://gtwy.ai" />
      </Head>
      <body suppressHydrationWarning>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PCV9RTTL');
          `}
        </Script>

        {/* GTM NoScript Fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PCV9RTTL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <Wrapper>{children}</Wrapper>
      </body>
    </html>
  );
}
