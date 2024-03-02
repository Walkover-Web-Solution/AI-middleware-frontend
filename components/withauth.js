"use client"


import { useSearchParams , useRouter } from "next/navigation";
const  WithAuth =  (Children ) => {
return (props) => {
    const router  = useRouter()
   const searchParams = useSearchParams()
    const  proxy_auth_token =searchParams.get('proxy_auth_token') 

    if (proxy_auth_token) {
      localStorage?.setItem('proxy_auth_token', proxy_auth_token);
      router.replace("/bridges");
      return;
    }

    if (localStorage?.getItem('proxy_auth_token')) {
      router.replace("/bridges");
      return;
    }
    return <Children /> ;
  };
}
export default WithAuth;


