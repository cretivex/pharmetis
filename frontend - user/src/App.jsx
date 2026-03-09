import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ProfileCompletionProvider } from './contexts/ProfileCompletionContext';
import ErrorBoundaryWrapper from './components/ErrorBoundaryWrapper';
import AppRoutes from './routes/AppRoutes';

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
