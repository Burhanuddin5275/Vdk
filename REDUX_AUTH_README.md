# Redux Authentication Implementation

This project has been updated to use Redux for authentication instead of AsyncStorage. The implementation provides a centralized state management solution for login/logout functionality.

## Architecture

### Redux Store Structure

```
store/
├── authSlice.ts      # Authentication slice with actions and reducers
├── store.ts          # Main store configuration with persistence
└── hooks.ts          # Typed Redux hooks
```

### Authentication State

```typescript
interface AuthState {
  isAuthenticated: boolean;
  phone: string | null;
  user: {
    name: string;
    email?: string;
  } | null;
}
```

## Key Features

### 1. Redux Toolkit with Persistence
- Uses `@reduxjs/toolkit` for modern Redux development
- Implements `redux-persist` for state persistence across app restarts
- Automatically saves authentication state to AsyncStorage

### 2. Authentication Actions
- `login(phone, user?)` - Logs in a user with phone number and optional user data
- `logout()` - Logs out the current user
- `setUser(user)` - Updates user information

### 3. Selectors
- `selectIsAuthenticated` - Returns authentication status
- `selectPhone` - Returns current user's phone number
- `selectUser` - Returns current user data

### 4. Custom Hook
- `useAuth()` - Provides easy access to authentication state and actions

## Usage Examples

### Login
```typescript
import { useAuth } from '@/hooks/useAuth';

const { login } = useAuth();

const handleLogin = () => {
  login('1234567890', { name: 'John Doe' });
};
```

### Logout
```typescript
import { useAuth } from '@/hooks/useAuth';

const { logout } = useAuth();

const handleLogout = () => {
  logout();
};
```

### Check Authentication Status
```typescript
import { useAuth } from '@/hooks/useAuth';

const { isAuthenticated, phone, user } = useAuth();

if (isAuthenticated) {
  console.log(`User ${user?.name} is logged in with phone ${phone}`);
}
```

## Migration from AsyncStorage

The following components have been updated to use Redux:

1. **Login.tsx** - Uses Redux for login action
2. **Profile.tsx** - Uses Redux for logout and authentication status
3. **Cart.tsx** - Uses Redux for user identification
4. **Wishlist.tsx** - Uses Redux for user identification
5. **Products.tsx** - Uses Redux for authentication checks
6. **Categories.tsx** - Uses Redux for authentication checks
7. **Brands.tsx** - Uses Redux for authentication checks

## Benefits

1. **Centralized State Management** - All authentication logic is in one place
2. **Persistence** - Authentication state persists across app restarts
3. **Type Safety** - Full TypeScript support with typed selectors and actions
4. **Performance** - Efficient state updates with Redux Toolkit
5. **Developer Experience** - Easy debugging with Redux DevTools
6. **Scalability** - Easy to extend with additional authentication features

## Setup

The Redux store is configured in `app/_layout.tsx` with the Provider and PersistGate components:

```typescript
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    {/* App content */}
  </PersistGate>
</Provider>
```

## Dependencies

- `@reduxjs/toolkit` - Modern Redux development
- `react-redux` - React bindings for Redux
- `redux-persist` - State persistence
- `@react-native-async-storage/async-storage` - Storage engine for persistence 