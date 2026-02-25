import { useEffect } from 'react';
import { CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '../hooks/useAnalytics';
import { useStoreAnalyticsEvent } from '../hooks/useBackendAnalytics';
import { EventType } from '../backend';

interface PaymentSuccessScreenProps {
  onNavigate: (screen: 'dashboard' | 'trades' | 'admin' | 'overview' | 'settings' | 'payment-success' | 'payment-failure') => void;
}

export default function PaymentSuccessScreen({ onNavigate }: PaymentSuccessScreenProps) {
  const { recordEvent } = useAnalytics();
  const storeBackendEvent = useStoreAnalyticsEvent();

  useEffect(() => {
    recordEvent('stripe', 'payment-success', 'Payment completed successfully');
    storeBackendEvent.mutate({
      eventType: EventType.Completed,
      elementId: 'payment-success',
      count: 1,
      payload: 'Payment completed successfully',
    });
  }, [recordEvent, storeBackendEvent]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-950 p-4">
      <div className="glass w-full max-w-md rounded-xl border border-white/10 bg-charcoal-900/80 p-8 text-center backdrop-blur-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-emerald-500/10 p-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-white">Payment Successful!</h1>
        <p className="mb-8 text-sm leading-relaxed text-white/60">
          Your subscription has been activated. You now have access to all premium features.
        </p>
        <Button
          onClick={() => onNavigate('dashboard')}
          className="w-full bg-emerald-500 text-black hover:bg-emerald-600"
        >
          <Home className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
