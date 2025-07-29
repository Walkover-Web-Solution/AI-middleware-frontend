import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomBaseQuery } from './baseQuery';
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_SERVER_URL;

// Create a custom base query with the Python server URL
const customBaseQuery = createCustomBaseQuery(PYTHON_URL);

export const serviceApi = createApi({
  reducerPath: 'serviceApi',
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getAllServices: builder.query({
      query: () => '/api/v1/config/service',
      transformResponse: (response) => {
        if (response && typeof response === "object") {
          const default_model = { ...response?.services };
          
          const services = Object.keys(response?.services || {}).map(service => ({
            value: service,
            displayName: service.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
          }));
          
          return { 
            services, 
            default_model 
          };
        }
        return { services: [], default_model: {} };
      },
    }),
  }),
});

export const { useGetAllServicesQuery } = serviceApi;
