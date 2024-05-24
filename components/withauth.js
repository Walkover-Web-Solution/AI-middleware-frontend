"use client"
import { useRouter } from 'next/navigation';

const WithAuth = (Children) => {
  return (props) => {
    const router = useRouter();

    if (localStorage.getItem('proxy_token')) {
      router.replace('/org');
    }
    return <Children />;
  };
};

export default WithAuth;

