import { useEffect } from 'react';
import UplinkControllerCard from '../components/dashboard/UplinkControllerCard';
import SystemHeartbeatCard from '../components/dashboard/SystemHeartbeatCard';
import LivePulseTerminal from '../components/dashboard/LivePulseTerminal';
import PerformanceTelemetryPanel from '../components/dashboard/PerformanceTelemetryPanel';
import AuditLedgerPanel from '../components/dashboard/AuditLedgerPanel';
import { useOnboardingTour } from '../components/tour/OnboardingTourProvider';
import type { TourStep } from '../components/tour/types';

const TOUR_STEPS: TourStep[] = [
  {
    id: 'uplink-controller',
    screen: 'dashboard',
    targetId: 'uplink-controller-card',
    title: 'Uplink Controller',
    description: 'Toggle your bot between EXECUTE and STANDBY modes. When active, your bot will execute trades.',
    placement: 'right',
  },
  {
    id: 'system-heartbeat',
    screen: 'dashboard',
    targetId: 'system-heartbeat-card',
    title: 'System Heartbeat',
    description: 'Monitor your bot status, license verification, and ICP cycles in real-time.',
    placement: 'right',
  },
  {
    id: 'live-pulse',
    screen: 'dashboard',
    targetId: 'live-pulse-terminal',
    title: 'Live Pulse Terminal',
    description: 'View recent heartbeat logs and test connectivity to your bot endpoint.',
    placement: 'bottom',
  },
  {
    id: 'performance-telemetry',
    screen: 'dashboard',
    targetId: 'performance-telemetry-panel',
    title: 'Performance Telemetry',
    description: 'Track your equity curve and trading performance over time.',
    placement: 'top',
  },
  {
    id: 'audit-ledger',
    screen: 'dashboard',
    targetId: 'audit-ledger-panel',
    title: 'Audit Ledger',
    description: 'Review all system actions and configuration changes in chronological order.',
    placement: 'top',
  },
];

export default function DashboardScreen() {
  const { registerSteps } = useOnboardingTour();

  useEffect(() => {
    registerSteps(TOUR_STEPS);
  }, [registerSteps]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Dashboard</h2>
        <p className="mt-1 text-sm text-white/60">Monitor your trading system and bot performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UplinkControllerCard />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SystemHeartbeatCard />
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 lg:col-span-2">
          <LivePulseTerminal />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 lg:col-span-3">
          <PerformanceTelemetryPanel />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 lg:col-span-3">
          <AuditLedgerPanel />
        </div>
      </div>
    </div>
  );
}
