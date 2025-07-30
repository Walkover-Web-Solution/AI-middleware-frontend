import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomBaseQuery } from './baseQuery';
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;

// Create a custom base query with the Python server URL
const customBaseQuery = createCustomBaseQuery(PYTHON_URL);

export const bridgeApi = createApi({
  reducerPath: 'bridgeApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Bridge', 'BridgeVersion'],
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
      providesTags: (result, error, bridgeId) => [
        { type: 'Bridge', id: bridgeId },
        'Bridge'
      ],
    }),
    createBridgeVersion: builder.mutation({
      query: (dataToSend) => ({
        url: '/bridge/versions/create',
        method: 'POST',
        body: dataToSend,
      }),
      invalidatesTags: ['Bridge', 'BridgeVersion'],
    }),
    getBridgeVersion: builder.query({
      query: (bridgeVersionId) => ({
        url: `/bridge/versions/get/${bridgeVersionId}`,
        method: 'GET',
      }),
      providesTags: (result, error, bridgeVersionId) => [
        { type: 'BridgeVersion', id: bridgeVersionId }
      ],
    }),
    updateBridge: builder.mutation({
      query: ({ bridgeId, dataToSend }) => ({
        url: `/api/v1/config/update_bridge/${bridgeId}`,
        method: 'POST',
        body: dataToSend,
      }),
      // Optimistic update implementation
      async onQueryStarted({ bridgeId, dataToSend }, { dispatch, queryFulfilled }) {
        // Optimistically update the getSingleBridge cache
        const patchResult = dispatch(
          bridgeApi.util.updateQueryData('getSingleBridge', bridgeId, (draft) => {
            // Handle bridge type update
            if (dataToSend.bridgeType !== undefined) {
              if (!draft.bridge) draft.bridge = {};
              draft.bridge.bridgeType = dataToSend.bridgeType;
            }

            // Handle other potential bridge updates
            Object.entries(dataToSend).forEach(([key, value]) => {
              if (key !== 'bridgeType' && draft.bridge && draft.bridge[key] !== undefined) {
                draft.bridge[key] = value;
              }
            });
          })
        );

        try {
          // Wait for the mutation to complete
          await queryFulfilled;

          // Explicitly refetch the getSingleBridge query to ensure fresh data
          dispatch(bridgeApi.util.invalidateTags([{ type: 'Bridge', id: bridgeId }]));
        } catch (error) {
          // If the mutation fails, revert the optimistic update
          patchResult.undo();

          // Optional: You can also dispatch a notification or handle the error
          console.error('Failed to update bridge:', error);
        }
      },
      invalidatesTags: (result, error, { bridgeId }) => [
        { type: 'Bridge', id: bridgeId },
        'Bridge'
      ],
    }),
    updateBridgeVersion: builder.mutation({
      query: ({ versionId, dataToSend }) => ({
        url: `/bridge/versions/update/${versionId}`,
        method: 'PUT',
        body: dataToSend,
      }),
      // Optimistic update implementation
      async onQueryStarted({ versionId, dataToSend }, { dispatch, queryFulfilled }) {
        // Optimistically update the getBridgeVersion cache
        const patchResult = dispatch(
          bridgeApi.util.updateQueryData('getBridgeVersion', versionId, (draft) => {
            // Handle nested configuration updates properly
            if (dataToSend.configuration) {
              if (!draft.bridge) draft.bridge = {};
              if (!draft.bridge.configuration) draft.bridge.configuration = {};

              // Update model and type
              if (dataToSend.configuration.model) {
                draft.bridge.configuration.model = dataToSend.configuration.model;
              }

              if (dataToSend.configuration.type) {
                draft.bridge.configuration.type = dataToSend.configuration.type;
              }

              // Update fine_tune_model if present
              if (dataToSend.configuration.fine_tune_model) {
                if (!draft.bridge.configuration.fine_tune_model) {
                  draft.bridge.configuration.fine_tune_model = {};
                }

                if (dataToSend.configuration.fine_tune_model.current_model) {
                  draft.bridge.configuration.fine_tune_model.current_model =
                    dataToSend.configuration.fine_tune_model.current_model;
                }
              }
            } else {
              // For other top-level updates
              Object.entries(dataToSend).forEach(([key, value]) => {
                if (draft[key] !== undefined) {
                  draft[key] = value;
                }
              });
            }
          })
        );

        try {
          // Wait for the mutation to complete
          await queryFulfilled;

          // // Explicitly refetch the getBridgeVersion query to ensure fresh data
          // dispatch(bridgeApi.util.invalidateTags([{ type: 'BridgeVersion', id: versionId }]));

          // // Force a refetch of the specific version
          // dispatch(bridgeApi.endpoints.getBridgeVersion.initiate(versionId, { forceRefetch: true }));
        } catch (error) {
          // If the mutation fails, revert the optimistic update
          patchResult.undo();

          // Optional: You can also dispatch a notification or handle the error
          console.error('Failed to update bridge version:', error);
        }
      },
      invalidatesTags: (result, error, { versionId }) => [
        { type: 'BridgeVersion', id: versionId }
      ],
    }),
    publishBridgeVersion: builder.mutation({
      query: (versionId) => ({
        url: `/bridge/versions/publish/${versionId}`,
        method: 'POST',
      }),
      // Add proper cache handling
      async onQueryStarted(versionId, { dispatch, queryFulfilled }) {
        try {
          // Wait for the mutation to complete
          await queryFulfilled;

          // Explicitly refetch the version data
          dispatch(bridgeApi.util.invalidateTags([{ type: 'BridgeVersion', id: versionId }]));

          // Also refresh any bridge data that might be affected
          dispatch(bridgeApi.util.invalidateTags(['Bridge']));
        } catch (error) {
          console.error('Failed to publish bridge version:', error);
        }
      },
      invalidatesTags: (result, error, versionId) => [
        { type: 'BridgeVersion', id: versionId },
        'Bridge'
      ],
    }),
    
   
  }),
});

export const { 
  useGetAllBridgesQuery, 
  useCreateBridgeMutation, 
  useGetSingleBridgeQuery, 
  useCreateBridgeVersionMutation, 
  useGetBridgeVersionQuery, 
  useUpdateBridgeMutation, 
  useUpdateBridgeVersionMutation, 
  usePublishBridgeVersionMutation,

} = bridgeApi;