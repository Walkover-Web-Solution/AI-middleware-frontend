import axios from "axios";

axios.interceptors.request.use(
    async (config) => {
        let localToken = process.env.NEXT_PUBLIC_ENV === 'local' ? localStorage.getItem("local_token") : null;
        let token = localStorage.getItem("proxy_token");

        if (token && config.url.includes("routes.msg91.com")) {
            config.headers['proxy_auth_token'] = token;
        } else {
            config.headers['proxy_auth_token'] = token;
        }

        if (process.env.NEXT_PUBLIC_ENV === 'local') {
            config.headers['Authorization'] = localToken;
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
        if (error?.response?.status === 401) {
            localStorage.clear();
        }
        return Promise.reject(error);
    }
);

export default axios;
