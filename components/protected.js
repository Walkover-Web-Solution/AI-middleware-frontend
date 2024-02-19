"use client"

import { useRouter } from "next/navigation"
import React from 'react';
 
const Protected = (WrappedComponent) => {
  return (props) => {
    const router  = useRouter()

    if (!localStorage.getItem("proxy_auth_token")) {
      router.replace('/');
      return null; 
    }
    return <WrappedComponent {...props} />;
  };
};

export default Protected;
