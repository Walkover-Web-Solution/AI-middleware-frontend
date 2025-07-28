'use client'
import React from 'react'
import LoadingSpinner from "@/components/loadingSpinner";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LoginPage = ({loading}) => {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen justify-between items-center px-4 md:px-8 lg:px-16">
    {/* Left Section */}
    {loading ? (
      <LoadingSpinner />
    ) : (
      <div className="flex flex-col md:flex-row h-screen w-screen justify-between items-center px-4 md:px-8 lg:px-16">
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-center items-start">
          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto">
            <Link href="/">
              <button className="text-lg md:text-xl flex justify-center items-center p-2 text-blue-400">
                <ChevronLeft />
                Back
              </button>
            </Link>
            <div className="mt-2 mb-8">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 mx-2">
                Login
              </h1>
              <h5 className="text-gray-500 text-base md:text-xl my-4 mx-2 opacity-50">
                Authenticate with Google
              </h5>
            </div>
            <div className="w-full flex items-start justify-start">
              <div id={process.env.NEXT_PUBLIC_REFERENCEID} />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="/container.svg"
            alt="container"
            width={0}
            height={0}
            style={{ maxHeight: "90vh", width: "auto" }}
            className="max-w-full h-auto"
          />
        </div>
      </div>
    )}
  </div>
  )
}

export default LoginPage