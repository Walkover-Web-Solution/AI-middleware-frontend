import axios from "axios";

axios.interceptors.request.use(
    async (config) => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.sKbA7M0mmWG1A6Rk41t1KapUAc3WpKv0xHPzdWPxh7Q' || localStorage.getItem("proxy_auth_token");
        if (token) {
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
