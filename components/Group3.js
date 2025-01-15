import Image from "next/image";

const Group3 = () => {
  return (
    <div className="flex flex-row items-stretch justify-between h-fit w-3/4 mx-auto mt-20  gap-4 ">
      <div
        className="flex-1 border-2 p-4 flex flex-col justify-between border-opacity-70 border-gray-400"
        style={{ borderWidth: "0.1px" }}
      >
        <div className="flex items-center mb-2">
          <Image
            src="/Settings.svg"
            alt="Setting Logo"
            className="mr-2"
            width={54}
            height={34}
            priority
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Connect Your Vision with the Right AI Engine
        </h1>
        <p className="text-md mb-4">
          Switch smoothly between AI engines to match your evolving needs.
          Empower your product with precision and adaptability.
        </p>
        <div className="flex justify-center mt-auto">
          {/* <Image
            src="/Services.svg"
            alt="Services Logo"
            className="mr-2"
            width={200}
            height={200}
            priority
          /> */}
        </div>
      </div>

      <div
        className="flex-1 border-2 p-4 flex flex-col justify-between border-opacity-70 border-gray-400 pb-0"
        style={{ borderWidth: "0.1px" }}
      >
        <Image
          src="/Bubble.svg"
          alt="Bubble Logo"
          className="mr-2"
          width={54}
          height={34}
          priority
        />
        <div className="flex items-center mb-2"></div>
        <h1 className="text-4xl font-bold mb-4">
          Chatbot That Speaks the Language of Your Product
        </h1>
        <p className="text-md mb-4">
          Bring intelligent, domain-focused chatbots and AI assistants into your
          operations with ease. Designed to address your industry's challenges,
          they enable seamless collaboration, streamline workflows, and elevate
          the way you do business.
        </p>
        <div className="flex justify-center mt-auto">
          <Image
            src="/Onboarding.svg"
            alt="Onboarding Logo"
            className="mr-2"
            width={320}
            height={430}
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default Group3;
