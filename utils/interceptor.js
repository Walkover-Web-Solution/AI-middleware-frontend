import axios from "axios";

axios.interceptors.request.use(
    async (config) => {
        if(config.url?.includes("publicAgent")){
            const token = config.url?.includes("login") ? localStorage.getItem("publicAgentProxyToken"): null
            let AuthToken = localStorage.getItem("AgentToken")
            config.headers['Authorization'] = !config.url?.includes("login") ? AuthToken : null;
            config.headers['proxy_auth_token'] = token;
        }
        else{
            let token = sessionStorage.getItem("proxy_token") ? sessionStorage.getItem("proxy_token") : localStorage.getItem("proxy_token");
            config.headers['proxy_auth_token'] = token;
            if (process.env.NEXT_PUBLIC_ENV === 'local')
                config.headers['Authorization'] = localStorage.getItem("local_token");
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
        if ((error?.response?.status === 401 && !error?.config?.url?.includes("publicAgent")) && (error?.response?.status === 401  && !sessionStorage.getItem("proxy_token"))) {
            localStorage.clear();
            if (window.location.href != '/login') localStorage.setItem("previous_url", window.location.href);
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axios;
