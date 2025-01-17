import Image from "next/image";

const Group4 = () => {
  return (
    <div className="relative flex w-3/4 mx-auto py-20 ">
      <div className="w-1/2 z-10 ">
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
        <h1 className="text-4xl font-bold mb-4">AI Playground:</h1>
        <h1 className="text-4xl font-bold mb-4">
          Test, Compare, and Perfect Your Models
        </h1>
        <p className="text-md">
          Get hands-on experience on our Experiment Playground - where your team
          can easily test different prompts and models side by side. It's the
          perfect space to compare performance, experiment with ideas and
          fine-tune your AI for the best results.
        </p>
        <button role="button" className="btn btn-primary mt-3">
          Start Building
        </button>
      </div>
      <div className="absolute inset-0 flex justify-center items-center overflow-visible z-0">
        <Image
          src="/Ellipse.svg"
          alt="Ellipse Logo"
          className="object-cover"
          width={1500}
          height={800}
          style={{
            transform: "translateX(25%)",
          }}
        />
      </div>
    </div>
  );
};

export default Group4;
