import { useEffect } from 'react';
import { XCircle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '../hooks/useAnalytics';
import { useStoreAnalyticsEvent } from '../hooks/useBackendAnalytics';
import { EventType } from '../backend';

interface PaymentFailureScreenProps {
  onNavigate: (screen: 'dashboard' | 'trades' | 'admin' | 'overview' | 'settings' | 'payment-success' | 'payment-failure') => void;
}

export default function PaymentFailureScreen({ onNavigate }: PaymentFailureScreenProps) {
  const { recordEvent } = useAnalytics();
  const storeBackendEvent = useStoreAnalyticsEvent();

  useEffect(() => {
    recordEvent('stripe', 'payment-failure', 'Payment failed or cancelled');
    storeBackendEvent.mutate({
      eventType: EventType.Stripe,
      elementId: 'payment-failure',
      count: 1,
      payload: 'Payment failed or cancelled',
    });
  }, [recordEvent, storeBackendEvent]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-950 p-4">
      <div className="glass w-full max-w-md rounded-xl border border-white/10 bg-charcoal-900/80 p-8 text-center backdrop-blur-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-white">Payment Failed</h1>
        <p className="mb-8 text-sm leading-relaxed text-white/60">
          Your payment was not completed. You can try again or return to the dashboard.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => onNavigate('settings')}
            className="w-full bg-emerald-500 text-black hover:bg-emerald-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={() => onNavigate('dashboard')}
            variant="outline"
            className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
