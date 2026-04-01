import { useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

/**
 * Wraps children in ErrorBoundary and resets error state when route changes.
 */
export default function ErrorBoundaryWrapper({ children }) {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname}>
      {children}
    </ErrorBoundary>
  );
}
