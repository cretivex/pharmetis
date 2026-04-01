import { AlertCircle } from 'lucide-react';
import Button from './Button';

function ErrorState({ message = 'Something went wrong.', retry = 'Try again', onRetry, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="alert"
    >
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" aria-hidden />
      <p className="text-sm text-slate-900 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          {retry}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
