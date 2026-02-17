import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

interface PaymentFailureScreenProps {
  onNavigateHome: () => void;
}

export default function PaymentFailureScreen({ onNavigateHome }: PaymentFailureScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-medium text-white">Payment Cancelled</h1>
        <p className="mb-8 text-white/60">
          Your payment was not completed. You can try again or contact support if you need assistance.
        </p>

        <Button
          onClick={onNavigateHome}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
