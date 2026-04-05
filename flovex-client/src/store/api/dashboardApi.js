import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL || ''}/api` }),
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    // GET /api/dashboard/stats
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),

    // GET /api/dashboard/recent
    getRecentTransactions: builder.query({
      query: () => '/dashboard/recent',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetRecentTransactionsQuery } = dashboardApi;
