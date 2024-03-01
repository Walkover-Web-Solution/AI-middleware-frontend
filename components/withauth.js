import { useEffect } from 'react';
import { useRouter } from 'next/router'; // Updated import for useRouter

const WithAuth = (Children) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      // Since useEffect runs on the client, you can safely use client-side features here
      const proxy_auth_token = new URLSearchParams(window.location.search).get('proxy_auth_token');

      if (proxy_auth_token) {
        localStorage.setItem('proxy_auth_token', proxy_auth_token);
        router.replace("/bridges");
        return;
      }

      if (localStorage.getItem('proxy_auth_token')) {
        router.replace("/bridges");
        return;
      }
    }, [router]); // Depend on router to rerun if router changes

    // Render the children directly. The useEffect hook will handle redirection as needed.
    return <Children {...props} />;
  };
};

export default WithAuth;
