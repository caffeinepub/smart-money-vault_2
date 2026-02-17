import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentFailureScreenProps {
  onNavigate: (screen: 'dashboard' | 'trades' | 'admin' | 'overview' | 'settings' | 'payment-success' | 'payment-failure') => void;
}

export default function PaymentFailureScreen({ onNavigate }: PaymentFailureScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-[#ef4444]/10 p-6">
            <XCircle className="h-16 w-16 text-[#ef4444] sm:h-20 sm:w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Payment Cancelled
          </h1>
          <p className="text-sm text-white/60 sm:text-base">
            Your payment was cancelled or failed. No charges were made to your account.
          </p>
        </div>
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-3 sm:space-y-0">
          <Button
            onClick={() => onNavigate('settings')}
            variant="outline"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Try Again
          </Button>
          <Button
            onClick={() => onNavigate('dashboard')}
            className="bg-profit text-black hover:bg-profit/90"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
