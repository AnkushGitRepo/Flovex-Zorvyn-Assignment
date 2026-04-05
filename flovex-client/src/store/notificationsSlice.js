import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
  },
  reducers: {
    addNotification(state, action) {
      state.items.unshift({
        id: Date.now(),
        message: action.payload.message,
        time: new Date().toISOString(),
        read: false,
      });
      // Keep at most 20 notifications
      if (state.items.length > 20) {
        state.items = state.items.slice(0, 20);
      }
    },
    markAllRead(state) {
      state.items = state.items.map((n) => ({ ...n, read: true }));
    },
    clearAll(state) {
      state.items = [];
    },
  },
});

export const { addNotification, markAllRead, clearAll } = notificationsSlice.actions;
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.items.filter((n) => !n.read).length;
export default notificationsSlice.reducer;
