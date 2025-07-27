import { login, logout, selectIsAuthenticated, selectPhone, selectUser } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const phone = useAppSelector(selectPhone);
  const user = useAppSelector(selectUser);

  const loginUser = (phone: string, user?: { name: string; email?: string }) => {
    dispatch(login({ phone, user }));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    isAuthenticated,
    phone,
    user,
    login: loginUser,
    logout: logoutUser,
  };
}; 