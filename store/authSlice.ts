import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  phone: string | null;
  user: {
    name: string;
    email?: string;
  } | null;
}

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
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectPhone = (state: { auth: AuthState }) => state.auth.phone;
export const selectUser = (state: { auth: AuthState }) => state.auth.user; 