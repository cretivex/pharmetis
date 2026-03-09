import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { NETWORK_ERROR_MESSAGE } from '../config/api';

export default function NetworkErrorBanner() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const handler = (e) => setMessage(e.detail?.message || NETWORK_ERROR_MESSAGE);
    window.addEventListener('api:networkError', handler);
    return () => window.removeEventListener('api:networkError', handler);
  }, []);

  if (!message) return null;

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 bg-red-500/10 border-b border-red-200 text-slate-900"
      role="alert"
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" aria-hidden />
        <p className="text-sm font-medium truncate">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => setMessage(null)}
        className="p-1 rounded hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
