import axios from "axios";

axios.interceptors.request.use(
    async (config) => {
        let token
        if(config.url.includes("routes.msg91.com")) token = localStorage.getItem("proxy_auth_token")
        else token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpcCI6Il9JUCIsIm9yZyI6eyJpZCI6IjEyNGRmZ2g2N2doaiJ9LCJ1c2VyIjp7ImlkIjoiMTI0ZGZnaDY3Z2hqIn19.528o-s4ALXMa7G6YE96nF_t1oLXDrBuRRdfUMr--628';
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
