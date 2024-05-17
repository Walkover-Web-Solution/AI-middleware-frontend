import { useRouter } from 'next/router';
import { useEffect } from 'react';

const WithAuth = (Children) => {
  const Auth = (props) => {
    const router = useRouter();

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const proxy_auth_token = new URLSearchParams(window.location.search).get('proxy_auth_token');

        if (proxy_auth_token) {
          localStorage.setItem('proxy_token', proxy_auth_token);
          router.replace('/org');
          return;
        }

        if (localStorage.getItem('proxy_token')) {
          router.replace('/org');
          return;
        }
      }
    }, [router]);

    return <Children {...props} />;
  };

  return Auth;
};

export default WithAuth;
