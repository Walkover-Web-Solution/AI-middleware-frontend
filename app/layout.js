import { Syne } from "next/font/google";


import "./globals.css";
import Wrapper from "@/wrapper/Wrapper";

const inter = Syne({ subsets: ["latin"] });

export const metadata = {
  title: "Ai middleware",
  description: "Simplified AI & chatbot integration",
};

export default function RootLayout({ children }) {
  return (

    <html lang="en" data-theme="light">

      <body suppressHydrationWarning>
        <Wrapper>
          {children}
        </Wrapper>

        {/* <script
        id="interface-main-script"
        interface_id="6630f4a201851c1d8df95184"
        src="https://interface-embed.viasocket.com/interface-dev.js"
      ></script> */}
      </body>
    </html>
  );
}

