import Image from "next/image";
import Link from "next/link";

const SuggestionTemplates = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center w-3/4 mx-auto mt-20 py-16 p-10 border-gray-400 rounded-md border-opacity-40 border-[0.1px] group max-h-[700px] md:max-h-[650px] hover:bg-zoom gap-4">
      <div className="w-[500px] transition-all ease-in-out duration-300 group-hover:scale-105 p-2">
        <div className="flex items-center mb-2">
          <Image
            src="/live.svg"
            alt="Live Logo"
            className="mr-2"
            width={54}
            height={34}
          />
        </div>
        <h1
          className={`text-4xl font-bold mb-4 transition-all ease-in-out duration-300 group-hover:scale-105  `}
        >
          Smart AI Recommendations for Better and Cost Effective Results
        </h1>
        <p className="text-md transition-all ease-in-out duration-300 group-hover:scale-105  ">
          Whether you’re building workflows, developing applications, or analyzing data, AIMiddleWare intelligently suggests the best AI models tailored to your tasks. This thoughtful approach helps optimize your processes while cutting costs by 20-30%, ensuring efficiency and value at every step.
        </p>
        <div>
          <Link href="/login">
            <button role="button" className="btn btn-primary btn-sm mt-3">
              Start Building
            </button>
          </Link>
        </div>
      </div>

      <Image
        src="/Suggestion.svg"
        alt="Right Side Image"
        width={300}
        height={300}
        layout="intrinsic"
      // layout="responsive"
      />
    </div>
  );
};

export default SuggestionTemplates;
