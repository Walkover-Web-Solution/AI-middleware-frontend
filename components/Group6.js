import Image from "next/image";

const Group6 = () => {
  return (
    <div className="w-full !min-h-full bg-white text-black flex justify-center relative">
      <div className="flex justify-center">
        <div className="w-3/5 text-center mt-20 relative">
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
            Everything you need to know about aimiddelware. Can't find the
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

          <div className="relative flex flex-col gap-7 mt-7 overflow-visible">
            {[
              "What is AIMiddleWare, and how does it work?",
              "Can I use AIMiddleWare without technical expertise?",
              "What types of AI models can I use with AIMiddleWare?",
              "Is my data secure with AIMiddleWare?",
              "How can AIMiddleWare help reduce costs for my business?",
            ].map((question, index) => (
              <div
                key={index}
                className="relative h-20 flex justify-between items-center p-4 bg-white shadow-md z-10 rounded-md"
                style={{
                  boxShadow:
                    "0px 4px 8px rgba(0, 0, 0, 0.1), 0px -4px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                <p>{question}</p>
                <button className="text-xl font-bold text-custom-blue">
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="!absolute">
        <Image src="/Ellipse.svg" alt="Ellipse Logo" width={2000} height={10} />
      </div>
    </div>
  );
};

export default Group6;
