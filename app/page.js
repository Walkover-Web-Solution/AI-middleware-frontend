import Group1 from "@/components/Group1";
import HeroPage from "@/components/HeroPage";
// import LoadingSpinner from "@/components/loadingSpinner";
import Group2 from "@/components/Group2";
import WithAuth from "@/components/withauth";
// import { loginUser } from "@/config";
// import { useRouter, useSearchParams } from "next/navigation";
// import React, { useLayoutEffect, useState } from "react";
import Group3 from "@/components/Group3";
import Group4 from "@/components/Group4";
import Group5 from "@/components/Group5";
import Group6 from "@/components/Group6";
import Footer from "@/components/Footer";

/**
 * This page is the entry point for the user to start the login process.
 * The page checks if the user has already logged in or not.
 * If the user has not logged in, it will redirect the user to the login page.
 * If the user has already logged in, it will redirect the user to the bridges page.
 */
function page() {
  // Get the Next.js router instanc
  // const [loading, setLoading] = useState(false);
  // const router = useRouter();
  // const searchParams = useSearchParams();
  // const proxy_auth_token = searchParams.get("proxy_auth_token");
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
    <div className="bg-black h-full w-full text-white">
      <HeroPage />
      <Group1 />
      <Group2 />
      <Group3 />
      <Group4 />
      <Group5 />
      <Group6 />
      <Footer />
    </div>
  );
}

// export default WithAuth(page);
export default page;
