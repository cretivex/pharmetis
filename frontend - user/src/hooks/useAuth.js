import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth, logoutUser } from '../store/authSlice';

/**
 * Auth state from Redux. Re-fetches session when another tab updates storage (optional sync).
 */
export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const status = useSelector((state) => state.auth.status);

  useEffect(() => {
    const onStorage = () => {
      dispatch(initializeAuth());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [dispatch]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: status === 'loading',
    isBuyer: user?.role === 'BUYER',
    logout: () => dispatch(logoutUser()),
  };
}

export default useAuth;
