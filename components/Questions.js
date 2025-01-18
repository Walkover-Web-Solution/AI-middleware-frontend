"use client";
import Image from "next/image";

const Questions = () => {
  return (
    <div className="w-full min-h-full flex justify-center ">
      <div className="flex justify-center ">
        <div className="w-full px-6 md:w-3/5 text-center ">
          <div className="flex items-center mb-2 justify-center">
            <Image
              src="/questions.svg"
              alt="Questions Logo"
              className="mr-2"
              width={96}
              height={34}
              priority
            />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Frequently asked questions
          </h1>
          <p className="text-2xl opacity-50">
            Everything you need to know about AIMiddleWare. Can't find the
            answer you're looking for? Feel free to{" "}
            <span>
              <a
                href="#"
                className="cursor-pointer text-blue-600 border-b-2 border-blue-600 z-10"
              >
                contact us
              </a>
            </span>
          </p>

          <div className="relative flex flex-col gap-7 mt-7 hero-bg-center text-black">
            {[
              {
                question: "What is AIMiddleWare, and how does it work?",
                answer:
                  "AIMiddleWare is a powerful platform that simplifies the integration of AI into your products. It provides tools like model suggestions, web crawling, and database integrations to help businesses easily build and deploy AI-powered workflows and applications.",
              },
              {
                question: "Can I use AIMiddleWare without technical expertise?",
                answer:
                  "Yes! AIMiddleWare is designed for both technical and non-technical users. Its intuitive interface and pre-built features make it easy to create and manage AI solutions without requiring deep coding knowledge.",
              },
              {
                question:
                  "What types of AI models can I use with AIMiddleWare?",
                answer:
                  "AIMiddleWare supports a wide variety of AI models, from pre-trained Large Language Models (LLMs) to custom APIs. You can select models tailored to your specific needs, such as content generation, data analysis, or customer service.",
              },
              {
                question: "Is my data secure with AIMiddleWare?",
                answer:
                  "Absolutely. AIMiddleWare is built with robust security measures to ensure that all your data integrations and workflows are secure and compliant with industry standards.",
              },
              {
                question:
                  "How can AIMiddleWare help reduce costs for my business?",
                answer:
                  "AIMiddleWare reduces costs by offering ready-made AI tools and integrations, removing the need for expensive in-house AI development. It also optimizes workflows, saving time and resources while boosting productivity.",
              },
            ].map((item, index) => (
              <div key={index} className="collapse collapse-plus bg-base-200">
                <input
                  type="radio"
                  name="my-accordion-3"
                  defaultChecked={index === 0}
                />
                <div className="collapse-title text-xl font-medium">
                  {item.question}
                </div>
                <div className="collapse-content">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div className="!absolute">
        <Image src="/Ellipse.svg" alt="Ellipse Logo" width={2000} height={10} />
      </div> */}
    </div>
  );
};

export default Questions;
