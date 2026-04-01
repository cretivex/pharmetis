import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ProfileCompletionProvider } from './contexts/ProfileCompletionContext';
import ErrorBoundaryWrapper from './components/ErrorBoundaryWrapper';
import AppRoutes from './routes/AppRoutes';
import { initializeAuth } from './store/authSlice';

function AppBootstrap() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppBootstrap />
        <ProfileCompletionProvider>
        <ErrorBoundaryWrapper>
          <AppRoutes />
        </ErrorBoundaryWrapper>
        </ProfileCompletionProvider>
      </BrowserRouter>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
