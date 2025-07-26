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
        params: { orgid },
      }),
      providesTags: ['Bridge'],

    }),
    createBridge: builder.mutation({
      query: (dataToSend) => ({
        url: '/api/v1/config/create_bridge',
        method: 'POST',
        body: dataToSend,
      }),
      invalidatesTags: ['Bridge'],
    }),
    getSingleBridge: builder.query({
      query: (bridgeId) => ({
        url: `/api/v1/config/getbridges/${bridgeId}`,
        method: 'GET',
      }),
      providesTags: ['singleBridge'],
    }),
    createBridgeVersion: builder.mutation({
      query: (dataToSend) => ({
        url: '/bridge/versions/create',
        method: 'POST',
        body: dataToSend,
      }),
      invalidatesTags: ['Bridge'],
    }),
    getBridgeVersion: builder.query({
      query: (bridgeVersionId) => ({
        url: `/bridge/versions/get/${bridgeVersionId}`,
        method: 'GET',
      }),
      providesTags: ['Bridge'],
    }),
    updateBridge: builder.mutation({
      query: ({bridgeId,dataToSend}) => ({
        url: `/api/v1/config/update_bridge/${bridgeId}`,
        method: 'POST',
        body: dataToSend,
      }),
      invalidatesTags: ['singleBridge','Bridge'],
    }),
  }),
  });

export const { useGetAllBridgesQuery, useCreateBridgeMutation ,useGetSingleBridgeQuery,useCreateBridgeVersionMutation,useGetBridgeVersionQuery,useUpdateBridgeMutation} = bridgeApi;
