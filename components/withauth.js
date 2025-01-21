"use client"
import { loginUser } from '@/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLayoutEffect, useState } from 'react';

const WithAuth = () => {
  const router = useRouter();

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
    if (proxyToken) {
      router.replace("/org");
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

      router.replace("/org");
      return;
    }
  }
  useLayoutEffect(() => {
    runEffect();
  }, []);

  if (localStorage.getItem('proxy_token')) {
    router.replace('/org');
  }
  return null;
};

export default WithAuth;

