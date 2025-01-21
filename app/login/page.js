'use client'
import WithAuth from "@/components/withauth";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useLayoutEffect } from "react";

const page = () => {
  const router = useRouter();
  async function runEffect() {
    if (localStorage.getItem('proxy_token')) {
      router.replace('/org');
      return;
    }
    // Configuration for the MSG91 authentication
    const configuration = {
      referenceId: process.env.NEXT_PUBLIC_REFERENCEID,
      success: (data) => {
        console.dir('success response', data);
      },
      failure: (error) => {
        console.error('failure reason', error);
      }
    };

    // Load the login script from msg91
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = () => {
      const checkInitVerification = setInterval(() => {
        if (typeof initVerification === 'function') {
          clearInterval(checkInitVerification);
          initVerification(configuration); // Initialize the login process
        }
      }, 100);
    };
    script.src = 'https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js';
    document.body.appendChild(script); // Add the script to the page
  }
  useLayoutEffect(() => {
    runEffect();
  }, []);

  return (
    <div className="flex h-screen w-screen justify-center items-center">
      <div className="flex-1 flex flex-col justify-center items-start">
        <div className="w-1/3 mx-auto pl-8">
          <Link href="/">
            <button className="text-xl flex justify-center items-center p-2 text-blue-400">
              <ChevronLeft />
              Back
            </button>
          </Link>
          <h1 className="text-5xl font-bold mb-4 mx-2">Sign Up</h1>
          <h5 className="text-gray-500 text-xl my-4 mx-2 opacity-50">
            Authenticate with Google
          </h5>
          <div className="w-full flex items-start justify-start">
            <div id={process.env.NEXT_PUBLIC_REFERENCEID} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <Image
          src="/container.svg"
          alt="container"
          width={0}
          height={0}
          style={{ height: "90vh", width: "auto" }}
        />
      </div>
      <WithAuth />
    </div>
  );
};

export default page;