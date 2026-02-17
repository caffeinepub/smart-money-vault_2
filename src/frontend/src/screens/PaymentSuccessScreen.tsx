import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

interface PaymentSuccessScreenProps {
  onNavigateHome: () => void;
}

export default function PaymentSuccessScreen({ onNavigateHome }: PaymentSuccessScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-profit/10 p-4">
            <CheckCircle2 className="h-16 w-16 text-profit" />
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-medium text-white">Payment Successful!</h1>
        <p className="mb-8 text-white/60">
          Your subscription has been activated. You can now access all premium features.
        </p>

        <Button
          onClick={onNavigateHome}
          className="bg-profit text-black hover:bg-profit/90"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
