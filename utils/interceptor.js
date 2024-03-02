import axios from "axios";

axios.interceptors.request.use(
    async (config) => { 
         if (NEXT_PUBLIC_ENV !== "local")
         {
            config.headers['Proxy_auth_token'] = localStorage.getItem("proxy_auth_token")
         }
         else {
            config.headers['Authorization'] =  process.env.NEXT_PUBLIC_AUTHORIZATION_CODE
         }
         return config
    },
    (error) => {
        Promise.reject(error)
    }
)
// response interceptor
axios.interceptors.response.use(
    (response) => {
        return response
    },
    async function (error) {
        if (error?.response?.status === 401) {
            localStorage.clear()
        }
        return Promise.reject(error)
    }
)

export default axios
