import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import DashboardScreen from '../../screens/DashboardScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import SettingsRouteScreen from '../../screens/SettingsRouteScreen';
import DashboardHeader from '../dashboard/DashboardHeader';
import { Heart } from 'lucide-react';

type Screen = 'dashboard' | 'settings' | 'settings-route';

function getScreenFromPath(): Screen {
  const path = window.location.pathname;
  if (path === '/settings') return 'settings-route';
  if (path === '/dashboard' || path === '/') return 'dashboard';
  return 'dashboard';
}

export default function AppShell() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(getScreenFromPath());
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentScreen(getScreenFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation handler that updates URL and screen
  const handleNavigate = (screen: 'dashboard' | 'settings') => {
    const targetScreen: Screen = screen === 'settings' ? 'settings-route' : 'dashboard';
    const path = screen === 'settings' ? '/settings' : '/dashboard';
    
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentScreen(targetScreen);
  };

  // Sync initial URL on mount
  useEffect(() => {
    const initialScreen = getScreenFromPath();
    if (initialScreen !== currentScreen) {
      setCurrentScreen(initialScreen);
    }
  }, []);

  const displayScreen = currentScreen === 'settings-route' ? 'settings' : currentScreen;

  return (
    <div className="flex h-screen flex-col bg-[#0A0A0A]">
      {/* Glassmorphism Header */}
      <DashboardHeader
        currentScreen={displayScreen as 'dashboard' | 'settings'}
        onNavigate={handleNavigate}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentScreen === 'dashboard' && <DashboardScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
        {currentScreen === 'settings-route' && <SettingsRouteScreen />}
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
