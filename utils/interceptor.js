import axios from "axios";

axios.interceptors.request.use(
    async (config) => {
        let token
        if(config.url.includes("routes.msg91.com")) token = localStorage.getItem("proxy_token")
        else token =  process.env.NEXT_PUBLIC_AUTHORIZATION_CODE
        if (token && config.url.includes("routes.msg91.com")) {
            config.headers['proxy_auth_token'] = token
        }
        else {
            config.headers['Authorization'] = token
            
        }
        return config
    },
    (error) => {
        Promise.reject(error)
    }
) 
// response interceptor
// axios.interceptors.response.use(
//     (response) => {
//         return response
//     },
//     async function (error) {
//         if (error?.response?.status === 401) {
//             localStorage.clear()
//         }
//         return Promise.reject(error)
//     }
// )

export default axios