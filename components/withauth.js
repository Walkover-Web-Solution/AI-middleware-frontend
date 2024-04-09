import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const WithAuth = (Children) => {
  return (props) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const proxy_auth_token = searchParams.get('proxy_auth_token');

    useEffect(() => {
      if (typeof window !== 'undefined') {
        // Access localStorage only in the client-side context
        if (proxy_auth_token) {
          localStorage.setItem('proxy_token', proxy_auth_token);
          router.replace('/org');
        } else if (localStorage.getItem('proxy_token')) {
          router.replace('/org');
        }
      }
    }, [proxy_auth_token, router]);

    return <Children {...props} />;
  };
};

export default WithAuth;
