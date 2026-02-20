import { useEffect } from 'react';
import LoginButton from '../auth/LoginButton';
import { LayoutDashboard, Settings, TrendingUp, BarChart3, Shield, Compass } from 'lucide-react';
import { useIsCallerAdmin } from '../../hooks/useAdmin';
import { useOnboardingTour } from '../tour/OnboardingTourProvider';
import { AnalyticsEntrypoint } from '../analytics/AnalyticsEntrypoint';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '../../backend';
import type { TourStep } from '../tour/types';

type Screen = 'dashboard' | 'trades' | 'admin' | 'overview' | 'settings' | 'payment-success' | 'payment-failure';

interface DashboardHeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  userProfile: UserProfile | null | undefined;
  onOpenAnalytics: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'header-nav',
    screen: 'all',
    targetId: 'main-navigation',
    title: 'Navigation',
    description: 'Use these tabs to navigate between different sections of Smart Money Vault.',
    placement: 'bottom',
  },
  {
    id: 'tour-button',
    screen: 'all',
    targetId: 'tour-launcher',
    title: 'Restart Tour',
    description: 'Click here anytime to restart this guided tour.',
    placement: 'bottom',
  },
  {
    id: 'analytics-button',
    screen: 'all',
    targetId: 'analytics-launcher',
    title: 'Analytics',
    description: 'View your activity and usage statistics here.',
    placement: 'bottom',
  },
];

export default function DashboardHeader({ currentScreen, onNavigate, userProfile, onOpenAnalytics }: DashboardHeaderProps) {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { startTour, registerSteps } = useOnboardingTour();

  useEffect(() => {
    registerSteps(TOUR_STEPS);
  }, [registerSteps]);

  return (
    <header className="border-b border-white/5 bg-[#121212]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4 sm:space-x-8 overflow-x-auto">
          <h1 className="whitespace-nowrap text-base font-medium tracking-tight text-white sm:text-lg">
            Smart Money Vault
          </h1>
          <nav id="main-navigation" className="flex space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center space-x-1 sm:space-x-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                currentScreen === 'dashboard'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => onNavigate('trades')}
              className={`flex items-center space-x-1 sm:space-x-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                currentScreen === 'trades'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Trades</span>
            </button>
            <button
              onClick={() => onNavigate('overview')}
              className={`flex items-center space-x-1 sm:space-x-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                currentScreen === 'overview'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Overview</span>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className={`flex items-center space-x-1 sm:space-x-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                currentScreen === 'settings'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            {!adminCheckLoading && isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center space-x-1 sm:space-x-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                  currentScreen === 'admin'
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                }`}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            id="tour-launcher"
            onClick={startTour}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Compass className="h-4 w-4" />
          </Button>
          <AnalyticsEntrypoint onClick={onOpenAnalytics} />
          {userProfile && (
            <span className="hidden text-sm text-white/50 sm:inline">{userProfile.name}</span>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
