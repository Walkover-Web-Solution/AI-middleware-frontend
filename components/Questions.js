import { FAQ_QUESTION_ANSWER } from "@/utils/enums";
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
          <p className="text-2xl">
            <span className="opacity-50">Everything you need to know about AIMiddleWare. Can't find the
            answer you're looking for? Feel free to{" "}</span>
            <span className="cursor-pointer text-blue-500 border-b-2 border-blue-600 z-10 opacity-90" >
                contact us
            </span>
          </p>

          <div className="relative flex flex-col gap-7 mt-7 hero-bg-center text-black">
            {
            FAQ_QUESTION_ANSWER.map((item, index) => (
              <div key={index} className="collapse collapse-plus bg-base-200">
                <input
                  type="radio"
                  name="my-accordion-3"
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
