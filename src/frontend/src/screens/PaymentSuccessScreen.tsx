import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentSuccessScreenProps {
  onNavigate: (screen: 'dashboard' | 'trades' | 'admin' | 'overview' | 'settings' | 'payment-success' | 'payment-failure') => void;
}

export default function PaymentSuccessScreen({ onNavigate }: PaymentSuccessScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-profit/10 p-6">
            <CheckCircle2 className="h-16 w-16 text-profit sm:h-20 sm:w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Payment Successful!
          </h1>
          <p className="text-sm text-white/60 sm:text-base">
            Your subscription has been activated. You can now access all premium features.
          </p>
        </div>
        <Button
          onClick={() => onNavigate('dashboard')}
          className="w-full bg-profit text-black hover:bg-profit/90 sm:w-auto"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
