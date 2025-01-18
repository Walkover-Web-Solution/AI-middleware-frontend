import { Inter } from "next/font/google";
import { Roboto } from "next/font/google";
import Image from "next/image";
import Header from "./Header";
import Link from "next/link";

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
    <div className="hero-bg flex flex-col h-screen w-full">
      <Header />
      <div className="flex flex-grow flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center text-center space-y-4 w-full max-w-screen-xl">
          <h1
            className={`${inter.className} text-5xl md:text-8xl px-6 font-medium`}
          >
            The Only Platform to Integrate AI into Your Product
          </h1>

          <div className="w-full max-w-4xl mx-auto px-6">
            <h5 className={`${roboto.className} text-xl leading-9 font-light`}>
              Seamlessly bring AI into your product with a single, powerful
              platform. From customization and integration to scaling and
              optimization, we provide everything you need.
            </h5>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Link href="/login">
            <button role="button" className="btn btn-primary">
              Start for free
            </button>
          </Link>
          <Link href="/showcase">
            <button className=" btn px-6 py-3 bg-transparent border border-white text-white rounded-lg w-auto text-center hover:text-black">
              Get demo
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroPage;
