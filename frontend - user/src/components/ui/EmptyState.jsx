import { Package } from 'lucide-react';
import Button from './Button';

function EmptyState({
  icon: Icon = Package,
  title = 'No items found',
  description,
  actionLabel,
  onAction,
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
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
