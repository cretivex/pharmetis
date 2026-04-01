import { Package } from 'lucide-react';

function EmptyState({
  icon: Icon = Package,
  title = 'No items found',
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <Icon className="w-12 h-12 text-slate-600 mb-4" aria-hidden />
      <h3 className="text-base font-medium text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 mb-6 max-w-sm">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
