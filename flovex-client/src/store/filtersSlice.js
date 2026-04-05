import { createSlice } from '@reduxjs/toolkit';

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    search: '',
    category: 'all',
    type: 'all',
    status: 'all',
    sort: 'newest',
    chartRange: 'weekly',
  },
  reducers: {
    setSearch: (state, action) => { state.search = action.payload; },
    setCategory: (state, action) => { state.category = action.payload; },
    setType: (state, action) => { state.type = action.payload; },
    setStatus: (state, action) => { state.status = action.payload; },
    setSort: (state, action) => { state.sort = action.payload; },
    setChartRange: (state, action) => { state.chartRange = action.payload; },
    resetFilters: (state) => {
      state.search = '';
      state.category = 'all';
      state.type = 'all';
      state.status = 'all';
      state.sort = 'newest';
    },
  },
});

export const { setSearch, setCategory, setType, setStatus, setSort, setChartRange, resetFilters } = filtersSlice.actions;
export const selectFilters = (state) => state.filters;
export default filtersSlice.reducer;
