"use client"

import React, { useEffect } from 'react'

function page () {


  async function runEffect() {
    if (!localStorage.getItem('proxy_auth_token')){
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
    redirectToProject()
  }
  useEffect(() => {
    runEffect()
  },[])

  const redirectToProject = async () => {
    console.log(localStorage)
    const token = localStorage.getItem('proxy_auth_token')
    if (token) {
      // if (process.env.REACT_APP_API_ENVIRONMENT === 'local') {
        localStorage.setItem('accessToken', token)
      // }
  }
}
  return (
    <div>
      <div id='870623l170791725365ccbfc587143' />
    </div>
  )
}

export default page
