import Image from "next/image";

const Group5 = () => {
  return (
    <div className="w-full mx-auto flex-row justify-center items-center text-center text-2xl">
      <p className="mb-6">Here's what people are saying about us</p>
      <Image
        src="/testimonials.svg"
        alt="comments"
        className="mx-auto pb-20"
        width={1500}
        height={500}
      />
    </div>
  );
};

export default Group5;
