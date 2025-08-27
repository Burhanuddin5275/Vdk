import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig } from 'redux-persist';

interface User {
  name: string;
  email?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  phone: string | null;
  user: User | null;
}

// This is a partial config that will be extended in store.ts
export const authPersistConfig = {
  key: 'auth',
  whitelist: ['isAuthenticated', 'phone', 'user'],
};

const initialState: AuthState = {
  isAuthenticated: false,
  phone: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ phone: string; user?: { name: string; email?: string } }>) => {
      state.isAuthenticated = true;
      state.phone = action.payload.phone;
      state.user = action.payload.user || { name: 'User' };
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.phone = null;
      state.user = null;
    },
    setUser: (state, action: PayloadAction<{ name: string; email?: string }>) => {
      state.user = action.payload;
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth?.isAuthenticated ?? false;
export const selectPhone = (state: { auth: AuthState }) => state.auth?.phone ?? null;
export const selectUser = (state: { auth: AuthState }) => state.auth?.user ?? null;