import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const DEFAULT_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Common header preparation logic
const prepareHeaders = (headers) => {
  // Add the same headers as in the axios interceptor
  const token = typeof window !== 'undefined' ? 
    (sessionStorage.getItem("proxy_token") || localStorage.getItem("proxy_token")) : null;
  
  headers.set('proxy_auth_token', token || '');
  
  // Add Authorization header for local environment
  if (process.env.NEXT_PUBLIC_ENV === 'local') {
    const localToken = typeof window !== 'undefined' ? localStorage.getItem("local_token") : null;
    if (localToken) {
      headers.set('Authorization', localToken);
    }
  }
  
  return headers;
};

/**
 * Creates a customBaseQuery with the specified base URL
 * @param {string} baseUrl - The base URL to use for requests (defaults to NEXT_PUBLIC_SERVER_URL)
 * @returns {Function} A configured fetchBaseQuery instance
 */
export const createCustomBaseQuery = (baseUrl = DEFAULT_URL) => {
  return fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  });
};

// For backward compatibility, export a default instance
export const customBaseQuery = createCustomBaseQuery();
