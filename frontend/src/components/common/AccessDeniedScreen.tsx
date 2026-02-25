import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function AccessDeniedScreen() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="glass max-w-md rounded-xl border border-white/10 bg-charcoal-900/80 p-8 text-center backdrop-blur-md">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">Access Denied</h2>
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          {isAuthenticated
            ? "You don't have permission to access this area. Admin privileges are required."
            : 'Please sign in to access this area.'}
        </p>
        {!isAuthenticated && (
          <Button
            onClick={login}
            className="bg-emerald-500 font-medium text-black hover:bg-emerald-600"
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
}
