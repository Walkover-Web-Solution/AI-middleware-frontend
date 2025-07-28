import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;

const customBaseQuery = fetchBaseQuery({
  baseUrl: PYTHON_URL,
  prepareHeaders: (headers) => {
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
  },
});

export const modelApi = createApi({
  reducerPath: 'modelApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Model'],
  endpoints: (builder) => ({
    getAllModels: builder.query({
      query: (service) => ({
        url: `/api/v1/config/service/models/${service}`,
        method: 'GET',
      }),
      providesTags: ['Model'],
    }),
  }),
  });

export const {useGetAllModelsQuery } = modelApi;
