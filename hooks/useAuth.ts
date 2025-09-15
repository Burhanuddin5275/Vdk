import { login, logout, selectIsAuthenticated, selectPhone, selectUser } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const phone = useAppSelector(selectPhone);
  const user = useAppSelector(selectUser);

  const loginUser = (phone: string) => {
    dispatch(login({ phone }));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    isAuthenticated: !!phone,
    phone,
    user: phone ? { name: phone } : null, // Maintain backward compatibility
    login: loginUser,
    logout: logoutUser,
  };
};