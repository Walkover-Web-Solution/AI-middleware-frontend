import { useEffect } from 'react';
import { useRouter } from 'next/router'; // Updated import for useRouter

const WithAuth = (Children) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      // Since useEffect runs on the client, you can safely use client-side features here
      const proxy_auth_token = new URLSearchParams(window.location.search).get('proxy_auth_token');

    if (proxy_auth_token) {
      localStorage?.setItem('proxy_token', proxy_auth_token);
      router.replace("/org");
      return;
    }

    if (localStorage?.getItem('proxy_token')) {
      router.replace("/org");
      return;
    }
    return <Children /> ;
  };
};

export default WithAuth;
