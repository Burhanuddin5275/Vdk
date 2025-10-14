import { login, logout, selectIsAuthenticated, selectPhone, selectUser, selectToken, selectPassword} from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const password = useAppSelector(selectPassword);
  const phone = useAppSelector(selectPhone);
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectUser);

  const loginUser = (credentials: { phone: string; token: string, password: string}) => {
    dispatch(login(credentials));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    isAuthenticated: !!token,
    phone,
    token,
    password,
    user: phone ? { token, name: phone } : null,
    login: loginUser,
    logout: logoutUser,
  };
};