import Image from "next/image";

const Group1 = () => {
  return (
    <div className="w-full flex justify-center bg-black">
      <Image
        src="/Group1.svg"
        alt="Background"
        className="object-contain"
        width={1280}
        height={620}
        priority
      />
    </div>
  );
};

export default Group1;
