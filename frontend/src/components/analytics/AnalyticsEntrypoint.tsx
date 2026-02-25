import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsEntrypointProps {
  onClick: () => void;
}

export function AnalyticsEntrypoint({ onClick }: AnalyticsEntrypointProps) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className="text-white/60 hover:bg-white/10 hover:text-white"
      id="analytics-launcher"
    >
      <BarChart3 className="h-4 w-4" />
    </Button>
  );
}
