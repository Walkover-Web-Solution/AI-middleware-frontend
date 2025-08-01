import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomBaseQuery } from './baseQuery';

const URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const knowledgeBaseApi = createApi({
  reducerPath: 'knowledgeBaseApi',
  baseQuery: createCustomBaseQuery(URL),
  tagTypes: ['KnowledgeBase'],
  endpoints: (builder) => ({
    // Get all knowledge base entries
    getAllKnowledgeBase: builder.query({
      query: (orgId) => ({
        url: '/rag/docs',
        method: 'GET',
      }),
      transformResponse: (response, meta, orgId) => {
        // Return the data in the format expected by the reducer
        const formattedResponse = {
          knowledgeBaseData: {}
        };
        
        if (response?.data) {
          formattedResponse.knowledgeBaseData[orgId] = response.data;
        }
        
        return formattedResponse;
      },
      providesTags: (result, error, orgId) => [
        { type: 'KnowledgeBase', id: orgId },
        'KnowledgeBase'
      ]
    }),
    
    // Create knowledge base entry
    createKnowledgeBase: builder.mutation({
      query: (data,orgId) => ({
        url: '/rag/',
        method: 'POST',
        body: data
      }),
      transformResponse: (response, meta, {orgId}) => {
        const formattedResponse = {
          knowledgeBaseData: {}
        };
        
        if (response?.data) {
          formattedResponse.knowledgeBaseData[orgId] = [{ 
            ...response.data, 
            docId: response.data._id, 
            _id: response.data._id 
          }];
        }      
        return formattedResponse;
      },
      invalidatesTags: (result, error, {orgId}) => [
        { type: 'KnowledgeBase', id: orgId },
        'KnowledgeBase'
      ]
    }),

    updateKnowledgeBase: builder.mutation({
      query: (data, orgId) => {
        const { data: dataToUpdate, id } = data.data;
        console.log(id,'id')
        return {
          url: `/rag/docs/${id}`,
          method: 'PATCH',
          body: dataToUpdate
        }
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('onQueryStarted arg:', arg);
        const { data, orgId } = arg;
        const { data: dataToUpdate, id } = data.data;
        
        const patchResult = dispatch(
          knowledgeBaseApi.util.updateQueryData('getAllKnowledgeBase', orgId, (draft) => {
            console.log('Optimistic update draft:', draft);
            
            // Fix: The draft IS the transformed response, so access it directly
            if (draft && draft.knowledgeBaseData && draft.knowledgeBaseData[orgId]) {
              const items = draft.knowledgeBaseData[orgId];
              const index = items.findIndex((item) => item._id === id);
              console.log('Found item at index:', index);
              if (index !== -1) {
                items[index] = { ...items[index], ...dataToUpdate };
              }
            } else if (Array.isArray(draft)) {
              // If draft is directly an array (in case transformResponse isn't applied to cache)
              const index = draft.findIndex((item) => item._id === id);
              console.log('Found item at index (array):', index);
              if (index !== -1) {
                draft[index] = { ...draft[index], ...dataToUpdate };
              }
            }
          })
        );
    
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Update failed, undoing optimistic update:', error);
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, {orgId}) => [
        { type: 'KnowledgeBase', id: orgId },
        'KnowledgeBase'
      ]
    }),

    deleteKnowledgeBase: builder.mutation({
      query: (data,orgId) => ({
        url: `/rag/docs/${data.id}`,
        method: 'DELETE'
      }),
      async onQueryStarted({ data, orgId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          knowledgeBaseApi.util.updateQueryData('getAllKnowledgeBase', orgId, (draft) => {
            // Fix: Access the correct nested structure
            if (draft.knowledgeBaseData && draft.knowledgeBaseData[orgId]) {
              const items = draft.knowledgeBaseData[orgId];
              const index = items.findIndex((item) => item._id === id);
              if (index !== -1) {
                items.splice(index, 1);
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, {id, orgId}) => {
        return [
        { type: 'KnowledgeBase', id: orgId },
        'KnowledgeBase'
        ];
      }
    })
  }),
});

export const {
  useGetAllKnowledgeBaseQuery,
  useCreateKnowledgeBaseMutation,
  useUpdateKnowledgeBaseMutation,
  useDeleteKnowledgeBaseMutation
} = knowledgeBaseApi;