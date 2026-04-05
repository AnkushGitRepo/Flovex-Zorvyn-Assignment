import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { dashboardApi } from './dashboardApi';
import { chartsApi } from './chartsApi';

const invalidateAll = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(dashboardApi.util.invalidateTags(['Dashboard']));
    dispatch(chartsApi.util.invalidateTags(['Charts']));
  } catch {}
};

export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL || ''}/api` }),
  tagTypes: ['Transaction'],
  endpoints: (builder) => ({
    // GET /api/transactions — supports query params
    getTransactions: builder.query({
      query: (params = {}) => ({
        url: '/transactions',
        params,
      }),
      providesTags: ['Transaction'],
    }),

    // GET /api/transactions/:id
    getTransaction: builder.query({
      query: (id) => `/transactions/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Transaction', id }],
    }),

    // POST /api/transactions
    createTransaction: builder.mutation({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
      invalidatesTags: ['Transaction'],
      onQueryStarted: invalidateAll,
    }),

    // PUT /api/transactions/:id
    updateTransaction: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/transactions/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Transaction'],
      onQueryStarted: invalidateAll,
    }),

    // DELETE /api/transactions/:id
    deleteTransaction: builder.mutation({
      query: (id) => ({ url: `/transactions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Transaction'],
      onQueryStarted: invalidateAll,
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionsApi;
