
"use client"

import React, {  useLayoutEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import WithAuth from '@/components/withauth';

function page ({params}) {

  const router = useRouter();

  async function runEffect() {
    if (localStorage.getItem('proxy_auth_token')){
      router.replace("/bridges");
      return ;
    }
      const configuration = {
        referenceId: '870623l170791725365ccbfc587143',
        success: (data) => {
          // get verified token in response
          console.log('success response', data)
        },
        failure: (error) => {
          // handle error
          console.log('failure reason', error)
        }
      }
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.onload = () => {
        const checkInitVerification = setInterval(() => {
          if (typeof initVerification === 'function') {
            clearInterval(checkInitVerification)
            initVerification(configuration)
          }
        }, 100)
      }
      script.src = 'https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js'
      document.body.appendChild(script)
  }
  useLayoutEffect(() => {
    runEffect()
  },[])

  return (
    <div style={{width : "100vw" , height : "100vh"}} className=' flex justify-center items-center'>
       <div id='870623l170791725365ccbfc587143' />
   </div>
  )
}

export default WithAuth(page)
