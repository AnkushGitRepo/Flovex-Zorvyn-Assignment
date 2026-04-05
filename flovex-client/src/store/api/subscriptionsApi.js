import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { dashboardApi } from './dashboardApi';
import { chartsApi } from './chartsApi';
import { transactionsApi } from './transactionsApi';

const invalidateRelated = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(dashboardApi.util.invalidateTags(['Dashboard']));
    dispatch(chartsApi.util.invalidateTags(['Charts']));
    dispatch(transactionsApi.util.invalidateTags(['Transaction']));
  } catch {}
};

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL || ''}/api` }),
  tagTypes: ['Subscription'],
  endpoints: (builder) => ({
    getSubscriptions: builder.query({
      query: (params = {}) => ({ url: '/subscriptions', params }),
      providesTags: ['Subscription'],
    }),

    getSubscription: builder.query({
      query: (id) => `/subscriptions/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Subscription', id }],
    }),

    createSubscription: builder.mutation({
      query: (body) => ({ url: '/subscriptions', method: 'POST', body }),
      invalidatesTags: ['Subscription'],
      onQueryStarted: invalidateRelated,
    }),

    updateSubscription: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/subscriptions/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Subscription'],
      onQueryStarted: invalidateRelated,
    }),

    deleteSubscription: builder.mutation({
      query: (id) => ({ url: `/subscriptions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Subscription'],
      onQueryStarted: invalidateRelated,
    }),

    processDueSubscriptions: builder.mutation({
      query: () => ({ url: '/subscriptions/process-due', method: 'POST' }),
      invalidatesTags: ['Subscription'],
      onQueryStarted: invalidateRelated,
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useProcessDueSubscriptionsMutation,
} = subscriptionsApi;
