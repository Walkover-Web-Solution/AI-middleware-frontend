import axios from "axios";

axios.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem("publicAgentProxyToken") || localStorage.getItem("proxy_token");
        config.headers['proxy_auth_token'] = token;
        let AuthToken = (localStorage.getItem("AgentToken") || localStorage.getItem("local_token"));
        if(!localStorage.getItem('publicAgentProxyToken')){
            config.headers['Authorization'] = AuthToken;
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
            // localStorage.clear();
            localStorage.setItem("previous_url", window.location.href);           
            // window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axios;
