import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import roleReducer from './roleSlice';
import filtersReducer from './filtersSlice';
import notificationsReducer from './notificationsSlice';
import { transactionsApi } from './api/transactionsApi';
import { dashboardApi } from './api/dashboardApi';
import { chartsApi } from './api/chartsApi';
import { subscriptionsApi } from './api/subscriptionsApi';

export const store = configureStore({
  reducer: {
    role: roleReducer,
    filters: filtersReducer,
    notifications: notificationsReducer,
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [chartsApi.reducerPath]: chartsApi.reducer,
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transactionsApi.middleware,
      dashboardApi.middleware,
      chartsApi.middleware,
      subscriptionsApi.middleware
    ),
});

setupListeners(store.dispatch);
