import axios from "axios";
import { useRouter } from "next/router";

axios.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem("proxy_token");

        config.headers['proxy_auth_token'] = token;
        if (process.env.NEXT_PUBLIC_ENV === 'local') {
            config.headers['Authorization'] = localStorage.getItem("local_token");
            config.headers['proxy-auth-token'] = token;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async function (error) {
        const router = useRouter();
        if (error?.response?.status === 401) {
            localStorage.clear();
            router.replace("/");
        }
        return Promise.reject(error);
    }
);

export default axios;
