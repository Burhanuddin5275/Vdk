import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { PersistConfig } from 'redux-persist';

export interface AuthState {
  phone: string | null;
  token: string | null;
}

// This is a partial config that will be extended in store.ts
export const authPersistConfig = {
  key: 'auth',
  whitelist: ['phone', 'token'],
} as const;

const initialState: AuthState = {
  phone: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ phone: string; token: string }>) => {
      state.phone = action.payload.phone;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.phone = null;
      state.token = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
const selectAuthState = (state: { auth: AuthState }) => state.auth;

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => !!auth.phone
);

export const selectPhone = createSelector(
  [selectAuthState],
  (auth) => auth.phone ?? null
);

export const selectToken = createSelector(
  [selectAuthState],
  (auth) => auth.token
);

// For backward compatibility
export const selectUser = createSelector(
  [selectPhone],
  (phone) => phone ? { name: phone } : null
);