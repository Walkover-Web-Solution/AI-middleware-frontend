import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomBaseQuery } from './baseQuery';

// Use the default server URL from the environment variables
const customBaseQuery = createCustomBaseQuery();

export const integrationApi = createApi({
  reducerPath: 'integrationApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Integration'], 
  endpoints: (builder) => ({
    getAllIntegrationData: builder.query({
      query: () => ({
        url: `/gtwyEmbed`,
        method: 'GET',
      }),
      providesTags: ['Integration']
    }),
    createIntegration: builder.mutation({
      query: (data) => ({
        url: '/gtwyEmbed/',
        method: 'POST',
        body: { name: data.name, org_id: data.orgId },
      }),
      // Use onQueryStarted for guaranteed refetch after successful creation
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          
          // Invalidate the Integration tag to clear cached data
          dispatch(integrationApi.util.invalidateTags(['Integration']));
          
          // Explicitly force a refetch of all integration data
          dispatch(
            integrationApi.endpoints.getAllIntegrationData.initiate(
              undefined,
              { subscribe: false, forceRefetch: true }
            )
          );
        } catch (error) {
          console.error('Create integration failed:', error);
        }
      },
      // Fallback invalidation
      invalidatesTags: ['Integration']
    }),
  }),
});

export const { useGetAllIntegrationDataQuery, useCreateIntegrationMutation } = integrationApi;