import { Inter } from "next/font/google";
import { Roboto } from "next/font/google";
import Image from "next/image";

// Load the font outside the component function
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300"],
  display: "swap",
});
const HeroPage = () => {
  return (
    <div
      className="flex flex-col items-center justify-center mt-12 gap-6"
      style={{ minHeight: "calc(100vh - 150px)" }}
    >
      <div className="flex flex-col items-center text-center space-y-4 w-full max-w-screen-xl">
        <h1 className={`${inter.className} text-8xl px-6 font-medium`}>
          Seamless AI and Chatbot
        </h1>
        <h1 className={`${inter.className} text-8xl px-6 font-medium`}>
          Integration,<span className="italic font-thin">Simplified</span>
        </h1>
        <div className="w-full max-w-4xl mx-auto px-6">
          <h5 className={`${roboto.className} text-2xl leading-9 font-light`}>
            Leverage the power of AI to simplify integration, optimize cost, and
            enhance performance—without reinventing the wheel.
          </h5>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        {/* <button className="px-6 py-3 bg-custom-blue text-white rounded-lg w-auto text-center">
          Start for free
        </button> */}
        <button role="button" className="btn btn-primary">
          Start for free
        </button>
        <button className="px-6 py-3 bg-transparent border border-white text-white rounded-lg w-auto text-center">
          Get demo
        </button>
      </div>
    </div>
  );
};

export default HeroPage;
