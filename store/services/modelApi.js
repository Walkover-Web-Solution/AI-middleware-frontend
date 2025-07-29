import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomBaseQuery } from './baseQuery';
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;

// Create a custom base query with the Python server URL
const customBaseQuery = createCustomBaseQuery(PYTHON_URL);

export const modelApi = createApi({
  reducerPath: 'modelApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Model'],
  endpoints: (builder) => ({
    getAllModels: builder.query({
      query: (service) => ({
        url: `/api/v1/config/service/models/${service}`,
        method: 'GET',
      }),
      providesTags: ['Model'],
    }),
  }),
  });

export const {useGetAllModelsQuery } = modelApi;
