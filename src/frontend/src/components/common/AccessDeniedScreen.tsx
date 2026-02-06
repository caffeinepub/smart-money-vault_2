import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AccessDeniedScreen() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Alert className="max-w-md border-white/10 bg-white/5">
        <ShieldAlert className="h-5 w-5 text-[#ef4444]" />
        <AlertTitle className="text-white">Access Denied</AlertTitle>
        <AlertDescription className="text-white/60">
          You don't have permission to access this area. Admin privileges are required.
        </AlertDescription>
      </Alert>
    </div>
  );
}
