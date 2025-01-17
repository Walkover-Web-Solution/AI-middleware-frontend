import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const Group2 = () => {
  const logos = [
    "/MSG91.svg",
    "/Channel.svg",
    "/Techdoc.svg",
    "/Socket.svg",
    "/Walkover.svg",
  ];
  return (
    <>
      <div className="flex-row justify-center w-3/4 mx-auto items-center text-center">
        <p className={`${inter.className} mb-10`}>Trusted by</p>
        <div className="flex justify-around pb-4">
          {logos.map((src, index) => (
            <Image key={index} src={src} alt="logo" width={125} height={40} />
          ))}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between w-3/4 mx-auto mt-20 py-16 p-10 border-gray-400 rounded-md border-opacity-40 border-[0.1px] group max-h-[600px] hover:bg-zoom">
        <div className="max-w-[360px] transition-all ease-in-out duration-300 group-hover:scale-110 ">
          <div className="flex items-center mb-2">
            <Image
              src="/live.svg"
              alt="Live Logo"
              className="mr-2"
              width={54}
              height={34}
              priority
            />
          </div>
          <h1
            className={`text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 `}
          >
            AI Playground:
          </h1>
          <h1
            className={`text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 `}
          >
            Test, Compare, and Perfect Your Models
          </h1>
          <p className="text-md transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 ">
            Get hands-on experience on our Experiment Playground - where your
            team can easily test different prompts and models side by side. It's
            the perfect space to compare performance , experiment with ideas and
            fine-tune your AI for the best results.
          </p>
          <div>
            <button role="button" className="btn btn-primary mt-3">
              Start Building
            </button>
          </div>
        </div>

        <div className="">
          <Image
            src="/Frame95318.svg"
            alt="Right Side Image"
            width={750}
            height={400}
            className="transition-all ease-in-out duration-300 group-hover:scale-125 group-hover:ml-10"
          />
        </div>
      </div>
    </>
  );
};

export default Group2;
