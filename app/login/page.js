"use client"

import React, { useEffect } from 'react'

function page ({params}) {

  useEffect(() => {
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
    console.log(script, 'sssss');
  },[])

  return (
    <div>
      <div className="hero min-h-screen bg-base-200">
  <div className="hero-content flex-col lg:flex-row-reverse">
    <div className="text-center lg:text-left">
      <h1 className="text-5xl font-bold">Login now!</h1>
      <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
    </div>
    <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
      <form className="card-body">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input type="email" placeholder="email" className="input input-bordered" required />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input type="password" placeholder="password" className="input input-bordered" required />
          <label className="label">
            <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
          </label>
        </div>
        <div className="form-control mt-6">
          <button className="btn btn-primary">Login</button>
          {/* <div id='870623l170791725365ccbfc587143' /> */}
        </div>
      </form>
    </div>
  </div>
</div>
    </div>
  )
}

export default page
