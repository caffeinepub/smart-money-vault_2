import LoginButton from '../auth/LoginButton';
import { LayoutDashboard, Settings } from 'lucide-react';
import type { UserProfile } from '../../backend';

interface DashboardHeaderProps {
  currentScreen: 'dashboard' | 'settings';
  onNavigate: (screen: 'dashboard' | 'settings') => void;
  userProfile: UserProfile | null | undefined;
}

export default function DashboardHeader({ currentScreen, onNavigate, userProfile }: DashboardHeaderProps) {
  return (
    <header className="border-b border-white/5 bg-[#121212]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          <h1 className="text-lg font-medium tracking-tight text-white">
            Smart Money Vault
          </h1>
          <nav className="flex space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentScreen === 'dashboard'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentScreen === 'settings'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {userProfile && (
            <span className="text-sm text-white/50">{userProfile.name}</span>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
