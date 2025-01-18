import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const page = () => {
  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <div className="flex-1 flex flex-col justify-center items-start">
        <div className="w-2/3 mx-auto pl-8">
          <Link href="/">
            <button className="text-xl flex justify-center items-center p-2">
              {/* <Image src="left.svg" alt="left logo" width={20} height={20} />{" "} */}
              <ChevronLeft />
              Back
            </button>
          </Link>
          <h1 className="text-5xl font-bold mt-4">Sign Up</h1>
          <h5 className="text-gray-500 text-xl m-4 opacity-50">
            authenticate with Google
          </h5>
          <div className="border-b-2 relative pb-8 flex flex-col items-center">
            <button className="rounded-full border font-bold border-black w-full p-4 mt-5 flex items-center justify-center gap-2">
              <Image
                src="google.svg"
                alt="google logo"
                width={24}
                height={24}
              />
              Sign in with Google
            </button>
            <h5 className="absolute -bottom-2 bg-white px-1 text-sm font-medium text-gray-500">
              or Sign up with
            </h5>
          </div>

          <div className="relative w-full mt-7">
            <label
              htmlFor="email"
              className="absolute -top-2 left-4 bg-white px-1 text-sm font-medium text-gray-500"
            >
              Work Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="work-name@company.com"
              className="input input-bordered w-full"
            />
          </div>
          <button className="btn rounded-full font-bold border-black w-full p-4 mt-5 text-gray-700 bg-gray-500">
            Continue
          </button>
          <h5 className="text-gray-500 mt-4">
            Already have an account?{" "}
            <span className="text-blue-500">
              <a href="#">Sign in</a>
            </span>
          </h5>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center ">
        <Image
          src="/container.svg"
          alt="container"
          width={0}
          height={0}
          style={{ height: "100vh", width: "auto" }}
        />
      </div>
    </div>
  );
};

export default page;
