import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

// Track our variables in memory as a backup
const variableStore = {
  data: {}
};

export const bridgeLocalApi = createApi({
  reducerPath: 'bridgeLocalApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Variables'],
  keepUnusedDataFor: 3600, // Keep unused data for 1 hour
  refetchOnMountOrArgChange: false, // Don't refetch when component mounts
  refetchOnReconnect: false, // Don't refetch when reconnecting
  refetchOnFocus: false, // Don't refetch when window gains focus
  endpoints: (builder) => ({
    getVariables: builder.query({
      queryFn: ({ bridgeId, versionId = "" }) => {
        const key = `${bridgeId}_${versionId}`;
        
        // First try to get from our in-memory store
        if (variableStore.data[key]) {
          return { data: variableStore.data[key] };
        }
        
        // Otherwise return default structure
        const defaultData = {
          bridgeVersionMapping: {
            [bridgeId]: versionId ? { 
              [versionId]: { variables: [] } 
            } : {}
          },
          allBridgesMap: {
            [bridgeId]: !versionId ? { variables: [] } : {}
          }
        };
        
        // Save to our backup store
        variableStore.data[key] = defaultData;
        
        return { data: defaultData };
      },
      // Make this query never expire from cache
      keepUnusedDataFor: 86400, // 24 hours
      providesTags: (result, error, { bridgeId, versionId = "" }) => [
        { type: 'Variables', id: `${bridgeId}-${versionId}` }
      ]
    }),

    updateVariables: builder.mutation({
      queryFn: ({ bridgeId, versionId = "", data }) => {
        const key = `${bridgeId}_${versionId}`;
        
        // Update our in-memory store immediately
        if (!variableStore.data[key]) {
          variableStore.data[key] = {
            bridgeVersionMapping: {
              [bridgeId]: versionId ? { [versionId]: {} } : {}
            },
            allBridgesMap: {
              [bridgeId]: !versionId ? {} : {}
            }
          };
        }
        
        // Update the in-memory store
        if (versionId) {
          if (!variableStore.data[key].bridgeVersionMapping[bridgeId][versionId]) {
            variableStore.data[key].bridgeVersionMapping[bridgeId][versionId] = {};
          }
          variableStore.data[key].bridgeVersionMapping[bridgeId][versionId].variables = data;
        } else {
          if (!variableStore.data[key].allBridgesMap[bridgeId]) {
            variableStore.data[key].allBridgesMap[bridgeId] = {};
          }
          variableStore.data[key].allBridgesMap[bridgeId].variables = data;
        }
        
        return { data };
      },
      async onQueryStarted({ bridgeId, versionId = "", data }, { dispatch, queryFulfilled }) {
        // Immediately update the cache using updateQueryData
        const patchResult = dispatch(
          bridgeLocalApi.util.updateQueryData(
            'getVariables',
            { bridgeId, versionId },
            (draft) => {
              if (!draft.bridgeVersionMapping) draft.bridgeVersionMapping = {};
              if (!draft.bridgeVersionMapping[bridgeId]) draft.bridgeVersionMapping[bridgeId] = {};

              if (versionId) {
                if (!draft.bridgeVersionMapping[bridgeId][versionId]) {
                  draft.bridgeVersionMapping[bridgeId][versionId] = {};
                }
                draft.bridgeVersionMapping[bridgeId][versionId].variables = [...data];
              } else {
                if (!draft.allBridgesMap) draft.allBridgesMap = {};
                if (!draft.allBridgesMap[bridgeId]) {
                  draft.allBridgesMap[bridgeId] = {};
                }
                draft.allBridgesMap[bridgeId].variables = [...data];
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Error updating variables', err);
          patchResult.undo();
        }
      },
      // Don't invalidate tags, as we want the getVariables cache to be updated but not invalidated
    }),
  }),
});

// Export the hooks from the API
export const {
  useGetVariablesQuery,
  useUpdateVariablesMutation
} = bridgeLocalApi;
