import { AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '../../lib/utils';

type StateMessageVariant = 'empty' | 'error';

interface StateMessageProps {
  variant: StateMessageVariant;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function StateMessage({ variant, title, description, action, className }: StateMessageProps) {
  const Icon = variant === 'error' ? AlertCircle : Settings;
  const iconColor = variant === 'error' ? 'text-loss' : 'text-white/40';

  return (
    <div className={cn('flex min-h-[200px] items-center justify-center p-6', className)}>
      <div className="max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <div className={cn('rounded-full p-3', variant === 'error' ? 'bg-loss/10' : 'bg-white/5')}>
            <Icon className={cn('h-8 w-8', iconColor)} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <p className="text-sm leading-relaxed text-white/60">{description}</p>
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            {action.icon || <RefreshCw className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
