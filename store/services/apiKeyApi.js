import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export const apiKeyApi = createApi({
  reducerPath: 'apiKeyApi',
  baseQuery: customBaseQuery,
  tagTypes: ['ApiKey'],
  endpoints: (builder) => ({
    getAllApiKey: builder.query({
      query: (orgId) => ({
        url: `/apikeys?org_id=${orgId}`,
        method: 'GET'
      }),
      providesTags: (result, error, orgId) => [
        { type: 'ApiKey', id: orgId },
        'ApiKey'
      ]
    }),
    saveApiKeys: builder.mutation({
      query: (data) => ({
        url: '/apikeys',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, data) => {
        const orgId = data.org_id || data.organization_id;
        return orgId 
          ? [{ type: 'ApiKey', id: orgId }, 'ApiKey'] 
          : ['ApiKey'];
      }
    }),
    updateApikey: builder.mutation({
      query: (dataToSend) => ({
        url: `/apikeys/${dataToSend.apikey_object_id}`,
        method: 'PUT',
        body: dataToSend
      }),
      async onQueryStarted(dataToSend, { dispatch, queryFulfilled, getState }) {
        const state = getState();
        const orgId = dataToSend.org_id;
        const result = apiKeyApi.endpoints.getAllApiKey.select(orgId)(state)?.data?.result;
        
        if (!result) return;
        
        const keyIndex = result.findIndex(key => key._id === dataToSend.apikey_object_id);
        if (keyIndex === -1) return;
        
        const patchResult = dispatch(
          apiKeyApi.util.updateQueryData('getAllApiKey', orgId, draft => {
            const updatedApiKey = { ...draft.result[keyIndex], ...dataToSend };
            draft.result[keyIndex] = updatedApiKey;
          })
        );
        
        try {
          await queryFulfilled;
        } catch (error) {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, data) => [{ type: 'ApiKey', id: data.org_id }]
    }),
    deleteApikey: builder.mutation({
      query: (id) => ({
        url: '/apikeys',
        method: 'DELETE',
        body: { apikey_object_id: id }
      }),
      // Optimistic update for instant UI feedback
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        // Find the API key data using the ID in all possible organization keys
        const state = getState();
        // We need to look through all cached queries to find which one contains our key
        const cache = state.apiKeyApi.queries;
        let orgId = null;
        let apiKeyToDelete = null;
        
        // Search through all cached API key queries to find the one with our ID
        Object.keys(cache).forEach(queryKey => {
          if (queryKey.startsWith('getAllApiKey')) {
            const result = cache[queryKey].data?.result;
            if (result) {
              const foundKey = result.find(key => key._id === id);
              if (foundKey) {
                apiKeyToDelete = foundKey;
                // Extract orgId from the query key or from the API key itself
                orgId = foundKey.org_id;
              }
            }
          }
        });
        
        if (!orgId || !apiKeyToDelete) return; // Can't find the key or its organization
        
        // Create an optimistic patch to update the cache immediately
        const patchResult = dispatch(
          apiKeyApi.util.updateQueryData('getAllApiKey', orgId, draft => {
            draft.result = draft.result.filter(key => key._id !== id);
          })
        );
        
        try {
          // Wait for the actual server response
          await queryFulfilled;
        } catch (error) {
          // If the server request fails, undo the optimistic update
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, data) => [{ type: 'ApiKey', id: data.org_id }]
    }),
  })
})

export const { 
  useGetAllApiKeyQuery, 
  useSaveApiKeysMutation, 
  useUpdateApikeyMutation, 
  useDeleteApikeyMutation 
} = apiKeyApi;