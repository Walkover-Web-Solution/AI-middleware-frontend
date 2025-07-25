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

export const bridgeApi = createApi({
  reducerPath: 'bridgeApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Bridge'],
  endpoints: (builder) => ({
    getAllBridges: builder.query({
      query: (orgid) => ({
        url: '/api/v1/config/getbridges/all',
        method: 'GET',
        params: orgid,
      }),
      providesTags: ['Bridge'],
      refetchOnMountOrArgChange: true,
    }),
    createBridge: builder.mutation({
      query: (dataToSend) => ({
        url: '/api/v1/config/create_bridge',
        method: 'POST',
        body: dataToSend,
      }),
      invalidatesTags: (result, error, arg) => (result ? [{ type: 'Bridge', id: arg.orgid }] : []),
    }),
  }),
});

export const { useGetAllBridgesQuery, useCreateBridgeMutation } = bridgeApi;
