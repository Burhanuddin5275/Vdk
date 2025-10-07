import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { 
  persistReducer, 
  persistStore, 
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER,
  PersistConfig 
} from 'redux-persist';
import authReducer, { AuthState, authPersistConfig } from './authSlice';

// Create a persisted reducer with proper typing
const rootPersistConfig: PersistConfig<AuthState> = {
  ...authPersistConfig,
  key: 'auth',
  storage: AsyncStorage,
  version: 1,
  whitelist: [...authPersistConfig.whitelist],
};

const persistedAuthReducer = persistReducer<AuthState>(rootPersistConfig, authReducer);

// Define the root state type
export interface RootState {
  auth: ReturnType<typeof persistedAuthReducer>;
}


export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;