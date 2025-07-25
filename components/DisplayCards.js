import Image from "next/image";
import Autoscroll from "./Autoscroll";
import GeminiIcon from "@/icons/GeminiIcon";
import GroqIcon from "@/icons/GroqIcon";
import OpenAiIcon from "@/icons/OpenAiIcon";
import AnthropicIcon from "@/icons/AnthropicIcon";
import GemmaIcon from "@/icons/GemmaIcon";
import OllamaIcon from "@/icons/OllamaIcon";
import HuggingFaceIcon from "@/icons/HuggingFaceIcon";
import Llama2Icon from "@/icons/Llama2Icon";
import AzureIcon from "@/icons/AzureIcon";
import LongChainIcon from "@/icons/LongChainIcon";
import VisionIcon from "@/icons/VisionIcon";

const DisplayCards = () => {
  const items = [
    { icon: AzureIcon, label: "Azure" },
    { icon: OpenAiIcon, label: "DALL-E" },
    { icon: VisionIcon, label: "Vision" },
    { icon: GeminiIcon, label: "Gemini" },
    { icon: HuggingFaceIcon, label: "HuggingFace" },
    { icon: OllamaIcon, label: "Ollama" },
    { icon: AnthropicIcon, label: "Anthropic" },
    { icon: GroqIcon, label: "Groq" },
    { icon: OpenAiIcon, label: "OpenAI" },
    { icon: GemmaIcon, label: "Gemma" },
    { icon: LongChainIcon, label: "LongChain" },
    { icon: Llama2Icon, label: "Llama2" },
  ];

  return (
    <div className="flex flex-col items-stretch w-3/4 mx-auto mt-20 gap-4 z-low">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 w-full md:max-w-[48%] rounded-md p-10 flex flex-col justify-between border-opacity-40 border-gray-400 border-[0.1px] relative overflow-hidden group hover:z-very-low  hover:bg-zoom">
          <div className="flex items-center mb-2 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 ">
            <Image
              src="/Settings.svg"
              alt="Setting Logo"
              className="mr-2"
              width={54}
              height={34}
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 ">
            Connect Your Vision with the Right AI Engine
          </h1>
          <p className="text-md mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
            Switch smoothly between AI engines to match your evolving needs.
            Empower your product with precision and adaptability.
          </p>
          <div className="mt-auto -mx-10">
            <Autoscroll items={items} />
          </div>
        </div>
        <div className="flex-1 rounded-md pb-0 p-10 flex flex-col justify-between border-opacity-40 border-gray-400 border-[0.1px] relative overflow-hidden group hover:z-very-low  hover:bg-zoom">
          <div className="flex items-center mb-2 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 ">
            <Image
              src="/Bubble.svg"
              alt="Bubble Logo"
              className="mr-2"
              width={54}
              height={34}
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 ">
            Chatbot That Speaks the Language of Your Product
          </h1>
          <p className="text-md mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4  ">
            Bring intelligent, domain-focused chatbots and AI assistants into
            your operations with ease. Designed to address your industry's
            challenges, they enable seamless collaboration, streamline
            workflows, and elevate the way you do business.
          </p>
          <div className="flex justify-center mt-auto relative">
            <Image
              src="/Onboarding.svg"
              alt="Onboarding Logo"
              width={320}
              height={430}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 w-full md:max-w-[48%] rounded-md p-10 flex flex-col justify-between border-opacity-40 border-gray-400 border-[0.1px] relative overflow-hidden group hover:z-very-low hover:bg-zoom">
          <div className="flex items-center mb-2 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
            <Image
              src="/live.svg"
              alt="Connect Apps Logo"
              className="mr-2"
              width={54}
              height={34}
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
            Connect Apps
          </h1>
          <p className="text-md mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
            Effortlessly integrate various apps and platforms, allowing them to
            work together seamlessly. From CRM tools to marketing platforms and
            databases, connect apps in one place to automate tasks, streamline
            workflows, and enhance productivity across different services.
          </p>
          <div className="flex justify-center mt-auto relative">
            <Image
              src="/ConnectApps.svg"
              alt="Connect Apps"
              width={320}
              height={430}
            />
          </div>
        </div>
        <div className="flex-1 w-full md:max-w-[54%] rounded-md p-10 flex flex-col justify-between border-opacity-40 border-gray-400 border-[0.1px] relative overflow-hidden group hover:z-very-low hover:bg-zoom">
          <div className="flex mb-4 items-center transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
            <Image
              src="/live.svg"
              alt="Test Cases Logo"
              className="mr-2"
              width={54}
              height={34}
            />
          </div>
          <h1 className="text-4xl mb-4 font-bold transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
            Test Cases
          </h1>
          <p className="text-md transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
            With test cases, you can ensure your workflows, integrations, and AI
            interactions work exactly as intended from start to finish. They
            help you catch potential issues, validate every step, and keep
            everything running seamlessly and reliably.
          </p>
          <div className="flex justify-center mt-auto relative">
            <Image
              src="/TestCase.svg"
              alt="Test Cases"
              width={520}
              height={630}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DisplayCards;
