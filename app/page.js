
"use client"
// eslint-disable
import React, {  useLayoutEffect } from 'react'
// import { useRouter } from 'next/navigation';
import WithAuth from '@/components/withauth';

function page ({params}) {

  // const router = useRouter();

  // This effect is called only once when the component is mounted
  // It checks if the user has already logged in or not
  // If the user has logged in, it will redirect the user to the bridges page
  // If the user has not logged in, it will redirect the user to the login page
  async function runEffect() {
    if (localStorage.getItem('proxy_auth_token')){
      // router.replace("/bridges");
      return ;
    }

    // If the user has not logged in, redirect the user to the login page
    const configuration = {
      referenceId: process.env.NEXT_PUBLIC_REFERENCEID, // The unique id of the app
      success: (data) => { // Called when the user is successfully authenticated
        // Get the verified token in response
        console.dir('success response', data);
      },
      failure: (error) => { // Called when there is an error
        // Handle the error
        console.error('failure reason', error);
      }
    };

    // Load the login script from msg91
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = () => {
      const checkInitVerification = setInterval(() => {
        if (typeof initVerification === 'function') {
          clearInterval(checkInitVerification);
          initVerification(configuration); // Initialize the login process
        }
      }, 100);
    };
    script.src = 'https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js';
    document.body.appendChild(script); // Add the script to the page
  }
  useLayoutEffect(() => {
    runEffect();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }} className=' flex justify-center items-center'>
      <div id={process.env.NEXT_PUBLIC_REFERENCEID} /> {/* The div is required for the login script to work */}
    </div>
  );
}

export default WithAuth(page)
