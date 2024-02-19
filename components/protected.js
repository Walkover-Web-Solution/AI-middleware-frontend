"use client"

import { useRouter } from "next/navigation"

function Protected({ children }) {
   const route = useRouter()
    const key = process.env.REACT_APP_API_ENVIRONMENT === 'local' ? 'accessToken' : 'proxy_auth_token'
    const token = localStorage.getItem(key)
   
  
    if (!token) {
    //   localStorage.clear()
        return route.replace(`/login`)
      }
    return children
  }
  export default Protected