import axios from "axios";
import { clearCookie, getFromCookies, setInCookies } from "./utility";

axios.interceptors.request.use(
    async (config) => {
        if(config.url?.includes("publicAgent")){
            const token = config.url?.includes("login") ? getFromCookies("publicAgentProxyToken"): null
            let AuthToken = getFromCookies("AgentToken")
            config.headers['Authorization'] = !config.url?.includes("login") ? AuthToken : null;
            config.headers['proxy_auth_token'] = token;
        }
        else{
            // Check if the request is going to PROXY_URL
            const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;
            
            if(config.url?.includes(PROXY_URL) || config.url?.includes('/api/c/')){
                // For PROXY_URL APIs, use proxy_auth_token
                let proxyToken = sessionStorage.getItem("proxy_token") ? sessionStorage.getItem("proxy_token") : getFromCookies("proxy_token");
                config.headers['proxy_auth_token'] = proxyToken;
            } else if(config.url?.includes('/localToken')){
                // For local token generation APIs, use proxy_auth_token (since no local_token exists yet)
                let proxyToken = sessionStorage.getItem("proxy_token") ? sessionStorage.getItem("proxy_token") : getFromCookies("proxy_token");
                config.headers['proxy_auth_token'] = proxyToken;
            } else {
                // For other backend APIs, use local_token in Authorization header
                let localToken = getFromCookies("local_token") || sessionStorage.getItem("local_token");
                config.headers['Authorization'] = localToken;
            }
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
            clearCookie()
            if (window.location.href != '/login') setInCookies("previous_url", window.location.href);
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axios;
