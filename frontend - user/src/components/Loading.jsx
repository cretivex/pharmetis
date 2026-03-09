function Loading({ message = 'Loading...', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
      role="status"
      aria-label={message}
    >
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
