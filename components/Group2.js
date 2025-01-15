import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const Trusted = () => {
  return (
    <>
      <div className="flex-row justify-center items-center text-center">
        <p className={`${inter.className} mb-10`}>Trusted by</p>
        <div className=" flex justify-around pb-4">
          <Image src="/MSG91.svg" alt="logo" width={125} height={40} />
          <Image src="/Channel.svg" alt="logo" width={125} height={40} />
          <Image src="/Techdoc.svg" alt="logo" width={125} height={40} />
          <Image src="/Socket.svg" alt="logo" width={125} height={40} />
          <Image src="/Walkover.svg" alt="logo" width={125} height={40} />
        </div>
      </div>
      <div
        className="flex flex-row items-center justify-between h-fit w-3/4 mx-auto mt-20 py-16  p-4 border-gray-400"
        style={{ borderWidth: "0.1px" }}
      >
        <div className="flex-1 ">
          <div className="flex items-center mb-2 ">
            <Image
              src="/live.svg"
              alt="Live Logo"
              className="mr-2"
              width={54}
              height={34}
              priority
            />
          </div>
          <h1 className={`text-4xl  font-bold mb-4`}>AI Playground:</h1>
          <h1 className={`text-4xl  font-bold mb-4`}>
            Test, Compare, and Perfect Your Models
          </h1>
          <p className="text-md">
            Get hands-on experience on our Experiment Playground - where your
            team can easily test different prompts and models side by side. It's
            the perfect space to compare performance, experiment with ideas and
            fine-tune your AI for the best results.
          </p>
          <button role="button" className="btn btn-primary mt-3">
            Start Building
          </button>
        </div>

        <div className=" flex justify-center">
          <Image
            src="/Frame95318.svg"
            alt="Right Side Image"
            className=" rounded-xl"
            width={750}
            height={400}
            priority
          />
        </div>
      </div>
    </>
  );
};

export default Trusted;
