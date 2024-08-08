// Protected.js
"use-client"

import { useRouter } from "next/navigation";
import React, { useEffect } from 'react';

const Protected = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
localStorageGet()
    }, []);

    const localStorageGet = () =>{
      if (typeof window !== 'undefined' && !localStorage.getItem("proxy_token")) {
        router.replace('/');
        return null;
      }
    }
    return <WrappedComponent {...props} />;
  };
};

export default Protected;