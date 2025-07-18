'use client';
import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { useDispatch } from "react-redux";

const WithPublicAgentAuth = (Children) => {
  return (props) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const proxy_auth_token = searchParams.get('proxy_auth_token');

    async function runEffect() {
      const publicAgentToken = localStorage.getItem('publicAgentProxyToken');
      const proxyAuthToken = proxy_auth_token;
      let redirectionUrl = localStorage.getItem("previous_url") || "/publicAgent";

      // if (publicAgentToken) {
      //   return;
      // }

      if (proxyAuthToken) {
        setLoading(true);
        localStorage.setItem('publicAgentProxyToken', proxyAuthToken);
        
        try {
          window.location.href = "/publicAgent";
        } catch (error) {
          console.error('Error during authentication:', error);
          setLoading(false);
        }
        return;
      }

      // Initialize the proxy auth for public agents
      const configuration = {
        referenceId: process.env.NEXT_PUBLIC_REFERENCEID,
        addInfo: {
          redirect_path: '/publicAgent/login'
        },
        success: (data) => {
          console.dir('Public agent login success', data);
        },
        failure: (error) => {
          console.error('Public agent login failed', error);
        }
      };

      // Load the login script from msg91
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.onload = () => {
        const checkInitVerification = setInterval(() => {
          if (typeof initVerification === 'function') {
            clearInterval(checkInitVerification);
            initVerification(configuration);
          }
        }, 100);
      };
      script.src = 'https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js';
      document.body.appendChild(script);
    }

    useLayoutEffect(() => {
      runEffect();
    }, []);

    return <Children {...props} loading={loading} />;
  };
};

export default WithPublicAgentAuth;
