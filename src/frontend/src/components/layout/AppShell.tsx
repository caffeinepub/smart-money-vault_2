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
      if (hash === 'dashboard' || hash === '') {
        setCurrentScreen('dashboard');
      } else if (hash === 'trades') {
        setCurrentScreen('trades');
      } else if (hash === 'admin') {
        setCurrentScreen('admin');
      } else if (hash === 'overview') {
        setCurrentScreen('overview');
      } else if (hash === 'settings') {
        setCurrentScreen('settings');
      }
    };

    updateRouteFromUrl();
    window.addEventListener('popstate', updateRouteFromUrl);
    return () => window.removeEventListener('popstate', updateRouteFromUrl);
  }, []);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    if (screen === 'payment-success' || screen === 'payment-failure') {
      window.history.pushState({}, '', `/${screen}`);
    } else {
      window.location.hash = screen;
    }
  };

  const showHeaderFooter = currentScreen !== 'payment-success' && currentScreen !== 'payment-failure';

  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      {showHeaderFooter && (
        <DashboardHeader
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          userProfile={userProfile}
        />
      )}

      <main className="flex-1 overflow-x-hidden">
        {currentScreen === 'dashboard' && <DashboardScreen />}
        {currentScreen === 'trades' && <TradesScreen />}
        {currentScreen === 'admin' && <AdminScreen />}
        {currentScreen === 'overview' && <OverviewScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
        {currentScreen === 'payment-success' && <PaymentSuccessScreen onNavigate={handleNavigate} />}
        {currentScreen === 'payment-failure' && <PaymentFailureScreen onNavigate={handleNavigate} />}
      </main>

      {showHeaderFooter && (
        <footer className="border-t border-white/5 bg-[#121212]/80 px-4 py-4 text-center backdrop-blur-xl sm:px-6">
          <p className="text-xs text-white/40 sm:text-sm">
            © {new Date().getFullYear()} Built with{' '}
            <Heart className="inline h-3 w-3 text-profit sm:h-4 sm:w-4" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-profit hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}
