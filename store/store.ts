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
import pointsReducer, { PointsState } from './pointsSlice';

// Create a persisted reducer with proper typing
const rootPersistConfig: PersistConfig<AuthState> = {
  ...authPersistConfig,
  key: 'auth',
  storage: AsyncStorage,
  version: 1,
};

const persistedAuthReducer = persistReducer<AuthState>(rootPersistConfig, authReducer);

// Define the root state type
export interface RootState {
  auth: ReturnType<typeof persistedAuthReducer>;
  points: ReturnType<typeof pointsReducer>;
}

// Create a persisted config for points
const pointsPersistConfig: PersistConfig<PointsState> = {
  key: 'points',
  storage: AsyncStorage,
  version: 1,
};

const persistedPointsReducer = persistReducer<PointsState>(pointsPersistConfig, pointsReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    points: persistedPointsReducer,
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