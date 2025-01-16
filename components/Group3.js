import Image from "next/image";
import Autoscroll from "./Autoscroll";
import GeminiIcon from "@/icons/GeminiIcon";
import GroqIcon from "@/icons/GroqIcon";
import OpenAiIcon from "@/icons/OpenAiIcon";
import AnthropicIcon from "@/icons/AnthropicIcon";
import GemmaIcon from "@/icons/GemmaIcon";
import OllamaIcon from "@/icons/OllamaIcon";

const Group3 = () => {
  // const items1 = [
  //   "langchain",
  //   "vision",
  //   "dall-e",
  //   "OpenAi",
  //   "Gemma",
  //   "Gemini",
  //   "Azure",
  //   "Hugging Face",
  //   "groq",
  //   "ANTHROP/C",
  //   "Ollama",
  //   "Llama2",
  // ];
  // const items2 = [
  //   "Gemini",
  //   "ANTHROP/C",
  //   "Ollama",
  //   "groq",
  //   "langchain",
  //   "vision",
  //   "dall-e",
  //   "OpenAi",
  //   "Gemma",
  //   "Llama2",
  //   "Azure",
  //   "Hugging Face",
  // ];
  // const items3 = [

  //   "Gemma",

  //   "Ollama",
  //   "Llama2",
  //   "Azure",
  //   "Hugging Face",

  //   "langchain",
  //   "vision",----

  // ];
  const items3 = [
    { icon: GeminiIcon, label: "Gemini" },
    { icon: AnthropicIcon, label: "Anthropic" },
    { icon: GroqIcon, label: "Groq" },
    { icon: OpenAiIcon, label: "OpenAI" },
    { icon: OpenAiIcon, label: "DALL-E" },
    { icon: GemmaIcon, label: "Gemma" },
    { icon: OllamaIcon, label: "Ollama" },
  ];
  return (
    <div className="flex flex-row items-stretch justify-between h-screen w-3/4 mx-auto mt-20 gap-4 ">
      <div className="flex-1 max-w-[550px] rounded-md p-10 flex flex-col justify-between border-opacity-40 border-gray-400 border-[0.1px] relative overflow-visible group hover:bg-zoom">
        <div className="flex items-center mb-2 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 group-hover:pt-9">
          <Image
            src="/Settings.svg"
            alt="Setting Logo"
            className="mr-2"
            width={54}
            height={34}
            priority
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 ">
          Connect Your Vision with the Right AI Engine
        </h1>
        <p className="text-md mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4">
          Switch smoothly between AI engines to match your evolving needs.
          Empower your product with precision and adaptability.
        </p>
        <div className=" mt-auto mb-24 -mx-10">
          {/* <Autoscroll items={items1} />
          <Autoscroll items={items2} /> */}
          <Autoscroll items={items3} />
        </div>
      </div>

      <div className="flex-1 rounded-md pb-0 p-10 flex flex-col justify-between border-opacity-40 border-gray-400 border-[0.1px] relative overflow-hidden group hover:bg-zoom">
        <div className="flex items-center mb-2 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 group-hover:pt-9 ">
          <Image
            src="/Bubble.svg"
            alt="Bubble Logo"
            className="mr-2"
            width={54}
            height={34}
            priority
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 ">
          Chatbot That Speaks the Language of Your Product
        </h1>
        <p className="text-md mb-4 transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4  ">
          Bring intelligent, domain-focused chatbots and AI assistants into your
          operations with ease. Designed to address your industry's challenges,
          they enable seamless collaboration, streamline workflows, and elevate
          the way you do business.
        </p>
        <div className="flex h-96 justify-center mt-auto transition-all ease-in-out duration-300 group-hover:scale-110 group-hover:pl-4 group-hover:pt-9 relative">
          <Image
            src="/Onboarding.svg"
            alt="Onboarding Logo"
            width={320}
            height={430}
          />
        </div>
      </div>
    </div>
  );
};

export default Group3;
