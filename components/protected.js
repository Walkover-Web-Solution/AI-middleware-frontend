// Protected.js
"use client"

import { useCustomSelector } from "@/customHooks/customSelector";
import { getFromCookies, setInCookies } from "@/utils/utility";
import { useRouter } from "next/navigation";
import React, { useEffect } from 'react';

const Protected = (WrappedComponent) => {
  const ProtectedComponent = (props) => {
    const router = useRouter();
    const isEmbedUser = useCustomSelector((state) => state.userDetailsReducer.userDetails.isEmbedUser);

    useEffect(() => {
      if ((typeof window !== 'undefined' && !getFromCookies("proxy_token")) && (!sessionStorage.getItem("proxy_token")) && !isEmbedUser) {
        if (window.location.href !== '/login') {
          setInCookies("previous_url", window.location.href);
        }
        router.replace('/login');
      }
    }, [router]);

    return <WrappedComponent {...props} isEmbedUser={!!(isEmbedUser && sessionStorage.getItem("proxy_token"))} />;
  };

  return ProtectedComponent;
};

export default Protected;