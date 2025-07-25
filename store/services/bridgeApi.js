import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Environment URLs from your config
const URL = process.env.NEXT_PUBLIC_SERVER_URL;
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;
const NEXT_PUBLIC_REFERENCEID = process.env.NEXT_PUBLIC_REFERENCEID;

// Create the bridge API service
export const bridgeApi = createApi({
  reducerPath: 'bridgeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: PYTHON_URL, // Primary base URL for bridge operations
    prepareHeaders: (headers, { getState, endpoint }) => {
      // Get token from state if needed
      const token = getState()?.authReducer?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      // Add reference ID for specific endpoints or all requests
      if (NEXT_PUBLIC_REFERENCEID) {
        headers.set('reference-id', NEXT_PUBLIC_REFERENCEID);
      }
      
      // You can also conditionally add reference ID for specific endpoints
      // if (['updateOrganizationData', 'createBridge'].includes(endpoint)) {
      //   headers.set('reference-id', NEXT_PUBLIC_REFERENCEID);
      // }
      
      return headers;
    },
  }),
  tagTypes: ['Bridge', 'BridgeVersion', 'Functions', 'Models', 'Services', 'TestCases'],
  endpoints: (builder) => ({
    // Bridge Management
    getAllBridges: builder.query({
      query: (org_id) => `/api/v1/config/getbridges/all`,
      providesTags: ['Bridge'],
    }),

    getSingleBridge: builder.query({
      query: (bridgeId) => `/api/v1/config/getbridges/${bridgeId}`,
      providesTags: (result, error, bridgeId) => [{ type: 'Bridge', id: bridgeId }],
    }),

    createBridge: builder.mutation({
      query: (dataToSend) => ({
        url: '/api/v1/config/create_bridge',
        method: 'POST',
        body: dataToSend,
      }),
      invalidatesTags: ['Bridge'],
    }),

    createBridgeWithAi: builder.mutation({
      query: (dataToSend) => ({
        url: '/api/v1/config/create_bridge_using_ai',
        method: 'POST',
        body: dataToSend,
      }),
      invalidatesTags: ['Bridge'],
    }),

    updateBridge: builder.mutation({
      query: ({ bridgeId, dataToSend }) => ({
        url: `/api/v1/config/update_bridge/${bridgeId}`,
        method: 'POST',
        body: dataToSend,
      }),
      invalidatesTags: (result, error, { bridgeId }) => [{ type: 'Bridge', id: bridgeId }],
    }),

    deleteBridge: builder.mutation({
      query: (bridgeId) => ({
        url: `${URL}/api/v1/config/deletebridges/${bridgeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bridge'],
    }),

    duplicateBridge: builder.mutation({
      query: (bridge_id) => ({
        url: '/bridge/duplicate',
        method: 'POST',
        body: { bridge_id },
      }),
      invalidatesTags: ['Bridge'],
    }),

    archiveBridge: builder.mutation({
      query: ({ bridge_id, newStatus }) => ({
        url: `${URL}/api/v1/config/bridge-status/${bridge_id}`,
        method: 'PUT',
        body: { status: newStatus },
      }),
      invalidatesTags: (result, error, { bridge_id }) => [{ type: 'Bridge', id: bridge_id }],
    }),

    // Bridge Version Management
    getBridgeVersion: builder.query({
      query: ({ bridgeVersionId }) => `/bridge/versions/get/${bridgeVersionId}`,
      providesTags: (result, error, { bridgeVersionId }) => [
        { type: 'BridgeVersion', id: bridgeVersionId }
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

    updateBridgeVersion: builder.mutation({
      query: ({ versionId, dataToSend }) => ({
        url: `/bridge/versions/update/${versionId}`,
        method: 'PUT',
        body: dataToSend,
      }),
      invalidatesTags: (result, error, { versionId }) => [
        { type: 'BridgeVersion', id: versionId }
      ],
    }),

    publishBridgeVersion: builder.mutation({
      query: ({ versionId }) => ({
        url: `/bridge/versions/publish/${versionId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Bridge', 'BridgeVersion'],
    }),

    discardBridgeVersion: builder.mutation({
      query: ({ bridgeId, versionId }) => ({
        url: `/bridge/versions/discard/${versionId}`,
        method: 'POST',
        body: { bridge_id: bridgeId },
      }),
      invalidatesTags: ['Bridge', 'BridgeVersion'],
    }),

    // Model and Service Management
    getAllModels: builder.query({
      query: (service) => `/api/v1/config/service/models/${service}`,
      providesTags: ['Models'],
    }),

    getSingleModels: builder.query({
      query: () => `${URL}/api/v1/config/models`,
      providesTags: ['Models'],
    }),

    getAllServices: builder.query({
      query: () => '/api/v1/config/service',
      providesTags: ['Services'],
    }),

    getPrebuiltTools: builder.query({
      query: () => '/api/v1/config/inbuilt/tools',
      providesTags: ['Services'],
    }),

    // Functions Management
    getAllFunctions: builder.query({
      query: (org_id) => '/functions/all',
      providesTags: ['Functions'],
    }),

    updateFunction: builder.mutation({
      query: ({ function_id, dataToSend }) => ({
        url: `/functions/${function_id}`,
        method: 'PUT',
        body: { dataToSend },
      }),
      invalidatesTags: ['Functions'],
    }),

    deleteFunction: builder.mutation({
      query: (function_name) => ({
        url: '/functions/',
        method: 'DELETE',
        body: { function_name },
      }),
      invalidatesTags: ['Functions'],
    }),

    // Playground and Testing
    dryRun: builder.mutation({
      query: ({ localDataToSend, bridge_id, modelType }) => {
        const endpoint = modelType === 'completion' 
          ? `${URL}/api/v1/model/playground/completion/${bridge_id}`
          : `/api/v2/model/playground/chat/completion/${bridge_id}`;
        
        return {
          url: endpoint,
          method: 'POST',
          body: localDataToSend,
        };
      },
    }),

    batchProcess: builder.mutation({
      query: (payload) => ({
        url: '/api/v2/model/batch/chat/completion',
        method: 'POST',
        body: payload,
      }),
    }),

    // Test Cases
    getAllTestCases: builder.query({
      query: ({ bridgeId }) => `/testcases/${bridgeId}`,
      providesTags: (result, error, { bridgeId }) => [
        { type: 'TestCases', id: bridgeId }
      ],
    }),

    createTestCase: builder.mutation({
      query: ({ bridgeId, data }) => ({
        url: `${URL}/testcases/`,
        method: 'POST',
        body: { bridge_id: bridgeId, ...data },
      }),
      invalidatesTags: (result, error, { bridgeId }) => [
        { type: 'TestCases', id: bridgeId }
      ],
    }),

    updateTestCase: builder.mutation({
      query: ({ bridge_id, dataToUpdate }) => ({
        url: `${URL}/testcases/`,
        method: 'PUT',
        body: { bridge_id, ...dataToUpdate },
      }),
      invalidatesTags: (result, error, { bridge_id }) => [
        { type: 'TestCases', id: bridge_id }
      ],
    }),

    deleteTestCase: builder.mutation({
      query: ({ testCaseId }) => ({
        url: `${URL}/testcases/`,
        method: 'DELETE',
        body: { id: testCaseId },
      }),
      invalidatesTags: ['TestCases'],
    }),

    runTestCase: builder.mutation({
      query: ({ versionId }) => ({
        url: `/api/v2/model/testcases/${versionId}`,
        method: 'POST',
        body: { version_id: versionId },
      }),
    }),

    getTestcasesScore: builder.query({
      query: (version_id) => `/bridge/versions/testcases/${version_id}`,
    }),

    // Optimization and AI Features
    optimizePrompt: builder.mutation({
      query: ({ bridge_id, data }) => ({
        url: `/bridge/${bridge_id}/optimize/prompt`,
        method: 'POST',
        body: data,
      }),
    }),

    optimizeSchema: builder.mutation({
      query: ({ data }) => ({
        url: '/utils/structured_output',
        method: 'POST',
        body: data,
      }),
    }),

    optimizeJson: builder.mutation({
      query: ({ data }) => ({
        url: '/bridge/genrate/rawjson',
        method: 'POST',
        body: data,
      }),
    }),

    generateSummary: builder.mutation({
      query: ({ versionId }) => ({
        url: '/bridge/summary',
        method: 'POST',
        body: { version_id: versionId },
      }),
    }),

    modelSuggestion: builder.query({
      query: ({ versionId }) => `/bridge/versions/suggest/${versionId}`,
    }),

    // Integration and API Management
    createApi: builder.mutation({
      query: (dataFromEmbed) => ({
        url: '/api/v1/config/createapi',
        method: 'POST',
        body: dataFromEmbed,
      }),
      invalidatesTags: ['Bridge'],
    }),

    updateApi: builder.mutation({
      query: ({ bridge_id, dataFromEmbed }) => ({
        url: `/api/v1/config/updateapi/${bridge_id}`,
        method: 'POST',
        body: dataFromEmbed,
      }),
      invalidatesTags: (result, error, { bridge_id }) => [{ type: 'Bridge', id: bridge_id }],
    }),

    // Image Processing
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/image/processing/',
        method: 'POST',
        body: formData,
      }),
    }),

    // Public Agents
    getAllAgents: builder.query({
      query: () => '/publicAgent/all',
    }),

    publicAgentLogin: builder.mutation({
      query: () => ({
        url: '/publicAgent/public/login',
        method: 'POST',
      }),
    }),

    privateAgentLogin: builder.mutation({
      query: () => ({
        url: '/publicAgent/login',
        method: 'POST',
      }),
    }),
  }),
});

// Export the auto-generated hooks
export const {
  // Bridge Management
  useGetAllBridgesQuery,
  useGetSingleBridgeQuery,
  useCreateBridgeMutation,
  useCreateBridgeWithAiMutation,
  useUpdateBridgeMutation,
  useDeleteBridgeMutation,
  useDuplicateBridgeMutation,
  useArchiveBridgeMutation,

  // Bridge Version Management
  useGetBridgeVersionQuery,
  useCreateBridgeVersionMutation,
  useUpdateBridgeVersionMutation,
  usePublishBridgeVersionMutation,
  useDiscardBridgeVersionMutation,

  // Model and Service Management
  useGetAllModelsQuery,
  useGetSingleModelsQuery,
  useGetAllServicesQuery,
  useGetPrebuiltToolsQuery,

  // Functions Management
  useGetAllFunctionsQuery,
  useUpdateFunctionMutation,
  useDeleteFunctionMutation,

  // Playground and Testing
  useDryRunMutation,
  useBatchProcessMutation,

  // Test Cases
  useGetAllTestCasesQuery,
  useCreateTestCaseMutation,
  useUpdateTestCaseMutation,
  useDeleteTestCaseMutation,
  useRunTestCaseMutation,
  useGetTestcasesScoreQuery,

  // Optimization and AI Features
  useOptimizePromptMutation,
  useOptimizeSchemaMutation,
  useOptimizeJsonMutation,
  useGenerateSummaryMutation,
  useModelSuggestionQuery,

  // Integration and API Management
  useCreateApiMutation,
  useUpdateApiMutation,

  // Image Processing
  useUploadImageMutation,

  // Public Agents
  useGetAllAgentsQuery,
  usePublicAgentLoginMutation,
  usePrivateAgentLoginMutation,
} = bridgeApi;