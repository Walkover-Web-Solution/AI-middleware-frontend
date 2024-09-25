
"use client"

import LoadingSpinner from '@/components/loadingSpinner';
import WithAuth from '@/components/withauth';
import { loginUser } from '@/config';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useLayoutEffect, useState } from 'react';

/**
 * This page is the entry point for the user to start the login process.
 * The page checks if the user has already logged in or not.
 * If the user has not logged in, it will redirect the user to the login page.
 * If the user has already logged in, it will redirect the user to the bridges page.
 */
function page() {
  // Get the Next.js router instanc
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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

    // Configuration for the MSG91 authentication
    const configuration = {
      referenceId: process.env.NEXT_PUBLIC_REFERENCEID,
      success: (data) => {
        console.dir('success response', data);
      },
      failure: (error) => {
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
      {loading ? <LoadingSpinner />
        :
        <div className='w-screen h-screen'>
          <main className='h-full flex justify-center items-center'>
            <section className="bg-gradient-to-r from-custom-blue to-custom-green mb-72">
              <div className="grid w-full place-items-center">
                <div className="flex flex-col items-center mx-auto text-center">
                  <h1 className="text-3xl font-semibold text-black uppercase md:text-5xl bg-gradient-to-r from-custom-blue to-custom-green bg-clip-text mb-3 font-mono">AI Middleware</h1>
                  <p className="text-lg leading-5 text-black">Seamless AI Integration, Simplified</p>
                  <a className="mt-8 mb-5 cursor-pointer animate-bounce">
                    <svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="27" cy="26" r="18" stroke="black" strokeWidth="2" />
                      <path d="M22.41 23.2875L27 27.8675L31.59 23.2875L33 24.6975L27 30.6975L21 24.6975L22.41 23.2875Z" fill="black" />
                    </svg>
                  </a>
                </div>
                <div id={process.env.NEXT_PUBLIC_REFERENCEID} />
              </div>
            </section>
            <footer className="absolute bottom-0 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                <path fill="#232B2B" fill-opacity="1" d="M0,64L34.3,69.3C68.6,75,137,85,206,128C274.3,171,343,245,411,250.7C480,256,549,192,617,165.3C685.7,139,754,149,823,160C891.4,171,960,181,1029,160C1097.1,139,1166,85,1234,80C1302.9,75,1371,117,1406,138.7L1440,160L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
                <text x="50%" y="98%" dominant-baseline="middle" text-anchor="middle" fill="none" stroke="white" stroke-width=".2" font-size="80" letter-spacing="0.4em" >DO IT FOR YOU</text>
              </svg>
            </footer>
          </main>
        </div>
      }
    </div>
  );
}

export default WithAuth(page)
