// withauth.js
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from 'react';

const WithAuth = (Children) => {
  return () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
      const proxy_auth_token = searchParams.get('proxy_auth_token');
      if (proxy_auth_token) {
        localStorage.setItem('proxy_auth_token', proxy_auth_token);
        router.replace("/bridges");
      } else if (localStorage.getItem('proxy_auth_token')) {
        router.replace("/bridges");
      }
    }, []);

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Children />
      </Suspense>
    );
  };
};

export default WithAuth;
