import UplinkControllerCard from '../components/dashboard/UplinkControllerCard';
import LivePulseTerminal from '../components/dashboard/LivePulseTerminal';
import PerformanceTelemetryPanel from '../components/dashboard/PerformanceTelemetryPanel';
import AuditLedgerPanel from '../components/dashboard/AuditLedgerPanel';

export default function DashboardScreen() {
  return (
    <div className="p-6">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top Left - Uplink Controller (Hero) */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <UplinkControllerCard />
        </div>

        {/* Top Right - Live Pulse Terminal */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 lg:col-span-2">
          <LivePulseTerminal />
        </div>

        {/* Middle Wide - Performance Telemetry */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 lg:col-span-3">
          <PerformanceTelemetryPanel />
        </div>

        {/* Bottom Wide - Audit Ledger */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 lg:col-span-3">
          <AuditLedgerPanel />
        </div>
      </div>
    </div>
  );
}
