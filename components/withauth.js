"use client";
import { loginUser } from "@/config";
import { useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { switchOrg } from "@/config";
import { userDetails } from "@/store/action/userDetailsAction";
import { useDispatch } from "react-redux";


const handleUserDetailsAndSwitchOrg = async (url, dispatch) => {
  await dispatch(userDetails());
  const companyRefId = extractCompanyRefId(url); 
  if (companyRefId) {
    await switchOrg(companyRefId); 
  }
};

const extractCompanyRefId = (url) => {
  const regex = /\/org\/(\d+)\//; // This assumes the company_ref_id is between '/org/' and another '/'
  const match = url.match(regex);
  return match ? match[1] : null; 
};


const WithAuth = (Children) => {
  return (props) => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const proxy_auth_token = searchParams.get('proxy_auth_token');
    // This effect is called only once when the component is mounted
    // It checks if the user has already logged in or not
    // If the user has logged in, it will redirect the user to the bridges page
    // If the user has not logged in, it will redirect the user to the login page
    async function runEffect() {

      const proxyToken = localStorage.getItem('proxy_token');
      const proxyAuthToken = proxy_auth_token;
      let redirectionUrl = localStorage.getItem("previous_url") || "/org";

      if (proxyToken) {
        if(localStorage.getItem("previous_url")){
          await handleUserDetailsAndSwitchOrg(redirectionUrl, dispatch);
        }
        router.replace(redirectionUrl);
        localStorage.removeItem("previous_url");
        return;
      }

      if (proxyAuthToken) {
        setLoading(true);
        localStorage.setItem('proxy_token', proxyAuthToken);

        if (process.env.NEXT_PUBLIC_ENV === 'local') {
          const localToken = await loginUser({
            userId: searchParams.get('user_ref_id'),
            orgId: searchParams.get('company_ref_id'),
            userName: '',
            orgName: ''
          });
          localStorage.setItem('local_token', localToken.token);
        }

        if(localStorage.getItem("previous_url")) {
          await handleUserDetailsAndSwitchOrg(redirectionUrl, dispatch);
        }
        router.replace(redirectionUrl);
        localStorage.removeItem("previous_url");
        return;
      }

      const configuration = {
        referenceId: process.env.NEXT_PUBLIC_REFERENCEID,
        addInfo: {
          redirect_path: '/login'
        },
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

    return <Children {...props} loading={loading}/>;
  }
};

export default WithAuth;

