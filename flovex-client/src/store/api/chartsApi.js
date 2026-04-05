import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chartsApi = createApi({
  reducerPath: 'chartsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL || ''}/api` }),
  tagTypes: ['Charts'],
  endpoints: (builder) => ({
    getWeeklyData: builder.query({
      query: () => '/charts/weekly',
      providesTags: ['Charts'],
    }),
    getMonthlyData: builder.query({
      query: () => '/charts/monthly',
      providesTags: ['Charts'],
    }),
    getCategoryBreakdown: builder.query({
      query: () => '/charts/categories',
      providesTags: ['Charts'],
    }),
    getCategoryTrend: builder.query({
      query: (category) => `/charts/category-trend?category=${encodeURIComponent(category)}`,
      providesTags: ['Charts'],
    }),
    getAllCategories: builder.query({
      query: () => '/charts/all-categories',
      providesTags: ['Charts'],
    }),
  }),
});

export const {
  useGetWeeklyDataQuery,
  useGetMonthlyDataQuery,
  useGetCategoryBreakdownQuery,
  useGetCategoryTrendQuery,
  useGetAllCategoriesQuery,
} = chartsApi;
