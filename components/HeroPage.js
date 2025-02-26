'use client'
import { Inter } from "next/font/google";
import { Roboto } from "next/font/google";
import Header from "./Header";
import Link from "next/link";
import { openModal } from "@/utils/utility";
import { MODAL_TYPE } from "@/utils/enums";
import DemoModal from "./modals/DemoModal";

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
    <div className="hero-bg flex flex-col w-full pt-32">
      <Header />
      <div className="flex flex-grow flex-col items-center justify-center gap-6  py-28">
        <div className="flex flex-col  text-center space-y-4 w-full max-w-screen-xl">
          <h1
            className={`${inter.className} text-2xl md:text-3xl px-6 font-medium bg-gradient-to-r from-green-200 to-blue-500 bg-clip-text text-transparent`}
          >
            The Only Platform To
          </h1>
          <h1
            className={`${inter.className} text-5xl md:text-8xl px-6 font-medium`}
          >
            Integrate AI into Your Product
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
          
          <button className=" btn px-6 py-3 bg-transparent border border-white text-white rounded-lg w-auto text-center hover:text-black" onClick={() => openModal(MODAL_TYPE?.DEMO_MODAL)}>
            Get demo
          </button>
        </div>
      </div>
      <DemoModal />
    </div>
  );
};

export default HeroPage;
