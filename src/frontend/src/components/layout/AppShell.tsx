import { useState, useEffect } from 'react';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import DashboardScreen from '../../screens/DashboardScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import TradesScreen from '../../screens/TradesScreen';
import AdminScreen from '../../screens/AdminScreen';
import OverviewScreen from '../../screens/OverviewScreen';
import PaymentSuccessScreen from '../../screens/PaymentSuccessScreen';
import PaymentFailureScreen from '../../screens/PaymentFailureScreen';
import DashboardHeader from '../dashboard/DashboardHeader';
import { Heart } from 'lucide-react';

type Screen = 'dashboard' | 'trades' | 'admin' | 'overview' | 'settings' | 'payment-success' | 'payment-failure';

export default function AppShell() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const { data: userProfile } = useGetCallerUserProfile();

  // Initialize route from URL on mount
  useEffect(() => {
    const updateRouteFromUrl = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.slice(1); // Remove '#'

      // Handle payment redirects from pathname
      if (path === '/payment-success') {
        setCurrentScreen('payment-success');
        return;
      }
      if (path === '/payment-failure') {
        setCurrentScreen('payment-failure');
        return;
      }

      // Handle hash-based routing
      if (hash) {
        const validScreens: Screen[] = ['dashboard', 'trades', 'admin', 'overview', 'settings'];
        if (validScreens.includes(hash as Screen)) {
          setCurrentScreen(hash as Screen);
          return;
        }
      }

      // Default to dashboard
      setCurrentScreen('dashboard');
    };

    updateRouteFromUrl();

    // Listen for hash changes
    const handleHashChange = () => {
      updateRouteFromUrl();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (screen: Screen) => {
    if (screen === 'payment-success' || screen === 'payment-failure') {
      // Payment screens use pathname
      window.history.pushState({}, '', `/${screen}`);
    } else {
      // Other screens use hash routing
      window.location.hash = screen;
    }
    setCurrentScreen(screen);
  };

  const handleNavigateHome = () => {
    window.history.pushState({}, '', '/');
    window.location.hash = 'dashboard';
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
        onNavigate={handleNavigate}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentScreen === 'dashboard' && <DashboardScreen />}
        {currentScreen === 'trades' && <TradesScreen />}
        {currentScreen === 'overview' && <OverviewScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
        {currentScreen === 'admin' && <AdminScreen />}
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
