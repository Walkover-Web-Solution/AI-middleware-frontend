import Image from "next/image";
import Link from "next/link";

const FeatureRequests = () => {
  return (
    <div className="relative flex w-3/4 mx-auto py-20 mt-20">
      <div className="w-full md:w-1/2">
        <h1 className="text-4xl font-bold mb-4">
          Recommend a Feature & Shape the Future of GTWY AI!
        </h1>
        <p className="text-md">
          We’re always looking to improve! Have an idea for a new feature? Let
          us know, and we’ll work on making GTWY AI even better for you.
        </p>
        <Link target="_blank" href="https://gtwy.featurebase.app/">
          <button role="button" className="btn btn-primary mt-3">
            Submit Your Idea
          </button>
        </Link>
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

export default FeatureRequests;
