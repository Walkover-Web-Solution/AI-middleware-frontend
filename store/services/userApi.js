import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomBaseQuery } from './baseQuery';

const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: createCustomBaseQuery(PROXY_URL),
  tagTypes: ['User', 'AuthKey'],
  endpoints: (builder) => ({
    // Get user details
    getUserDetails: builder.query({
      query: () => ({
        url: '/api/c/getDetails',
        method: 'GET'
      }),
      // Force data refetching every time
      keepUnusedDataFor: 0, // Don't keep data in cache
      refetchOnMountOrArgChange: true, // Refetch when component mounts
      refetchOnFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting
      transformResponse: (response) => {
        console.log('getUserDetails response:', response);
        
        // Get the user details from the response
        const userData = response?.data?.data?.[0] || response?.data[0] || response;
        
        // Transform organizations to match the userDetailsReducer structure
        if (userData && userData.c_companies) {
          // Keep the original userData
          const result = { ...userData };
          
          // Transform organizations into an object with IDs as keys
          const organizations = {};
          userData.c_companies.forEach(element => {
            organizations[element.id] = element;
          });
          
          // Add the transformed organizations to the result
          result.organizations = organizations;
          result.success = userData.success || true;
          
          console.log('Transformed user data:', result);
          return result;
        }
        
        return userData;
      },
      providesTags: ['User']
    }),
    
    // Logout user
    logout: builder.mutation({
      query: () => ({
        url: '/api/c/logout',
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    }),
    
    // Get all auth keys
    getAllAuthKeys: builder.query({
      query: (name) => ({
        url: '/api/c/authkey',
        method: 'GET',
        params: name ? { name } : undefined
      }),
      transformResponse: (response) => {
        return response?.data?.data || response?.data || response;
      },
      providesTags: ['AuthKey']
    }),
    
    // Create auth key
    createAuthKey: builder.mutation({
      query: (dataToSend) => ({
        url: '/api/c/authkey',
        method: 'POST',
        body: dataToSend
      }),
      invalidatesTags: ['AuthKey']
    }),
    
    // Delete auth key
    deleteAuthKey: builder.mutation({
      query: (id) => ({
        url: `/api/c/authkey/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['AuthKey']
    }),
    
    // Switch user (needed for local environment)
    switchUser: builder.mutation({
      query: (data) => ({
        url: '/api/c/switchUser',
        method: 'POST',
        body: data
      }),
    }),
  }),
});

export const {
  useGetUserDetailsQuery,
  useLogoutMutation,
  useGetAllAuthKeysQuery,
  useCreateAuthKeyMutation,
  useDeleteAuthKeyMutation,
  useSwitchUserMutation,
} = userApi;
