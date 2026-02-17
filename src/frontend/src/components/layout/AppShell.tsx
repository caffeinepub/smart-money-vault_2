import { useState, useEffect } from 'react';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import DashboardScreen from '../../screens/DashboardScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import PaymentSuccessScreen from '../../screens/PaymentSuccessScreen';
import PaymentFailureScreen from '../../screens/PaymentFailureScreen';
import DashboardHeader from '../dashboard/DashboardHeader';
import { Heart } from 'lucide-react';

type Screen = 'dashboard' | 'settings' | 'payment-success' | 'payment-failure';

export default function AppShell() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const { data: userProfile } = useGetCallerUserProfile();

  // Check URL path on mount to handle payment redirects
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/payment-success') {
      setCurrentScreen('payment-success');
    } else if (path === '/payment-failure') {
      setCurrentScreen('payment-failure');
    }
  }, []);

  const handleNavigateHome = () => {
    // Clear the URL path
    window.history.pushState({}, '', '/');
    setCurrentScreen('dashboard');
  };

  // Payment screens don't show header/footer
  if (currentScreen === 'payment-success') {
    return <PaymentSuccessScreen onNavigateHome={handleNavigateHome} />;
  }

  if (currentScreen === 'payment-failure') {
    return <PaymentFailureScreen onNavigateHome={handleNavigateHome} />;
  }

  return (
    <div className="flex h-screen flex-col bg-[#0A0A0A]">
      {/* Glassmorphism Header */}
      <DashboardHeader
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentScreen === 'dashboard' && <DashboardScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#121212]/80 px-6 py-3 backdrop-blur-xl">
        <p className="text-center text-xs text-white/30">
          © {new Date().getFullYear()}. Built with <Heart className="inline h-3 w-3 text-rose-500" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
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
