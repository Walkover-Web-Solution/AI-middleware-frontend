import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="flex justify-between items-center px-28 py-8">
      <div className="flex space-x-12">
        <div className="flex">
          <Image
            src="/ButtonMd.svg"
            alt="Background"
            className=""
            width={32}
            height={32}
          />
          <p className=" font-medium cursor-pointer">AI MIDDLEWARE</p>
        </div>
        <p className=" font-medium cursor-pointer">Pricing</p>
      </div>

      <div className="flex space-x-8">
        <button className="px-6 py-2 bg-transparent border border-white text-white rounded">
          Login
        </button>
        {/* <button className="px-6 py-2 bg-custom-blue text-white rounded ">
          Start for free
        </button> */}
        <button role="button" className="btn btn-primary">
          Start for free
        </button>
      </div>
    </header>
  );
};

export default Header;
