import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomBaseQuery } from './baseQuery';
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;
export const orgApi = createApi({
  reducerPath: 'orgApi',
  baseQuery: createCustomBaseQuery(PROXY_URL),
  endpoints: (builder) => ({
    createOrg: builder.mutation({
      query: (dataToSend) => ({
        url: '/api/c/createCompany',
        method: 'POST',
        body: dataToSend
      }),
      // Handle the deeply nested response structure
      transformResponse: (response) => {
        console.log('Raw API response:', response);
        return response?.data?.data || response?.data || response;
      }
    }),
    getAllOrg: builder.query({
      query: () => ({
        url: '/api/c/getCompanies',
        method: 'GET'
      }),
      // Transform the response to match the expected format
      transformResponse: (response) => {
        console.log('GetAllOrg full response:', response);
        
        // Log each level of the response to identify where the data is
        if (response?.data) console.log('response.data:', response.data);
        if (response?.data?.data) console.log('response.data.data:', response.data.data);
        
        // Try different paths, with fallbacks
        const result = response?.data?.data || response?.data || response;
        console.log('GetAllOrg result after transform:', result);
        return result;
      }
    }),
    switchOrg: builder.mutation({
      query: (company_ref_id) => ({
        url: '/api/c/switchCompany',
        method: 'POST',
        body: { company_ref_id }
      }),
      async onQueryStarted({ company_ref_id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("current_org_id", company_ref_id);
        } catch (error) {
          console.error(error);
        }
      }
    })
  })
});

export const { useCreateOrgMutation, useGetAllOrgQuery, useSwitchOrgMutation } = orgApi;
