// Protected.js
"use-client"

import { useRouter } from "next/navigation";
import React, { useEffect } from 'react';

const Protected = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    if (typeof window !== 'undefined' && !localStorage.getItem("proxy_token")) {
      if(window.location.href!='/login')localStorage.setItem("previous_url", window.location.href);           
      router.replace('/login');
      return null;
    }
    return <WrappedComponent {...props} />;
    
  };
};

export default Protected;