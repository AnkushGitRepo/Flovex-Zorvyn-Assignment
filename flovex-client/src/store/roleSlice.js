import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('flovex_role');

const roleSlice = createSlice({
  name: 'role',
  initialState: { value: saved || 'viewer' },
  reducers: {
    setRole: (state, action) => {
      state.value = action.payload;
      localStorage.setItem('flovex_role', action.payload);
    },
  },
});

export const { setRole } = roleSlice.actions;
export const selectRole = (state) => state.role.value;
export const selectIsAdmin = (state) => state.role.value === 'admin';
export default roleSlice.reducer;
