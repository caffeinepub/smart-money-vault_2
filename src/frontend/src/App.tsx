import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import LoginButton from './components/auth/LoginButton';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import AppShell from './components/layout/AppShell';
import { Loader2, Heart } from 'lucide-react';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  // Show minimalist landing screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0A0A0A] px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-5xl font-medium tracking-tight text-white">
            Welcome to the Vault
          </h1>
          <p className="text-sm text-white/50">
            Institutional-grade trading intelligence on Internet Computer
          </p>
        </div>
        <LoginButton />
        <footer className="absolute bottom-8 text-center">
          <p className="text-xs text-white/30">
            © 2026. Built with <Heart className="inline h-3 w-3 text-rose-500" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 transition-colors hover:text-white/60"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    );
  }

  // Show profile setup modal if user has no profile yet
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <AppShell />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}
