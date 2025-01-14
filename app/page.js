"use client";

import Header from "@/components/header";
import HeroPage from "@/components/heroPage";
import LoadingSpinner from "@/components/loadingSpinner";
import WithAuth from "@/components/withauth";
import { loginUser } from "@/config";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useLayoutEffect, useState } from "react";

/**
 * This page is the entry point for the user to start the login process.
 * The page checks if the user has already logged in or not.
 * If the user has not logged in, it will redirect the user to the login page.
 * If the user has already logged in, it will redirect the user to the bridges page.
 */
function page() {
  // Get the Next.js router instanc
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const proxy_auth_token = searchParams.get("proxy_auth_token");
  // This effect is called only once when the component is mounted
  // It checks if the user has already logged in or not
  // If the user has logged in, it will redirect the user to the bridges page
  // If the user has not logged in, it will redirect the user to the login page
  // async function runEffect() {
  //   const proxyToken = localStorage.getItem("proxy_token");
  //   const proxyAuthToken = proxy_auth_token;

  //   if (proxyToken) {
  //     router.replace("/org");
  //     return;
  //   }

  //   if (proxyAuthToken) {
  //     setLoading(true);
  //     localStorage.setItem("proxy_token", proxyAuthToken);

  //     if (process.env.NEXT_PUBLIC_ENV === "local") {
  //       const localToken = await loginUser({
  //         userId: searchParams.get("user_ref_id"),
  //         orgId: searchParams.get("company_ref_id"),
  //         userName: "",
  //         orgName: "",
  //       });
  //       localStorage.setItem("local_token", localToken.token);
  //     }

  //     router.replace("/org");
  //     return;
  //   }

  //   // Configuration for the MSG91 authentication
  //   const configuration = {
  //     referenceId: process.env.NEXT_PUBLIC_REFERENCEID,
  //     success: (data) => {
  //       console.dir("success response", data);
  //     },
  //     failure: (error) => {
  //       console.error("failure reason", error);
  //     },
  //   };

  //   // Load the login script from msg91
  //   const script = document.createElement("script");
  //   script.type = "text/javascript";
  //   script.onload = () => {
  //     const checkInitVerification = setInterval(() => {
  //       if (typeof initVerification === "function") {
  //         clearInterval(checkInitVerification);
  //         initVerification(configuration); // Initialize the login process
  //       }
  //     }, 100);
  //   };
  //   script.src = "https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js";
  //   document.body.appendChild(script); // Add the script to the page
  // }
  // useLayoutEffect(() => {
  //   runEffect();
  // }, []);

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="bg-black text-white relative"
    >
      <div className="absolute ">
        <img
          src="./Elipse.svg"
          alt="Background"
          // className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      <Header />
      <HeroPage />
    </div>
  );
}

export default WithAuth(page);
