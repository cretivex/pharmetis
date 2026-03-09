function Loading({ message = 'Loading...', fullScreen = false, className = '' }) {
  const wrapperClass = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95'
    : `flex flex-col items-center justify-center py-12 ${className}`;

  return (
    <div className={wrapperClass} role="status" aria-label={message}>
      <div
        className="h-10 w-10 rounded-full border-2 border-blue-200 border-t-primary animate-spin"
        aria-hidden
      />
      {message && (
        <p className="mt-4 text-sm text-slate-600">{message}</p>
      )}
    </div>
  );
}

export default Loading;
