import Image from "next/image";
import React from "react";

function ErrorPage() {
  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="container flex flex-col md:flex-row items-center justify-center px-5 text-gray-700">
        <div className="w-full lg:w-1/2 mx-8 text-center">
          <div className="text-7xl text-green-500 font-dark font-extrabold mb-8">404</div>
          <p className="text-2xl md:text-3xl font-light leading-normal mb-8">
            Sorry we couldn't find the page you're looking for
          </p>
          <a
            href="javascript:history.back()"
            className="px-5 inline py-3 text-sm font-medium leading-5 shadow-2xl text-white transition-all duration-400 border border-transparent rounded-lg focus:outline-none bg-green-600"
          >
            Go back
          </a>
        </div>
        <div className="w-full lg:w-1/2 mx-5 my-12 flex justify-center">
          <Image
            src="https://user-images.githubusercontent.com/43953425/166269493-acd08ccb-4df3-4474-95c7-ad1034d3c070.svg"
            alt="Page not found"
            width={500} // Adjust width as needed
            height={300} // Adjust height as needed
          />
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
