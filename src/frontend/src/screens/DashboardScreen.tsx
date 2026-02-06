import SystemHeartbeatCard from '../components/dashboard/SystemHeartbeatCard';
import EquityCurvePanel from '../components/dashboard/EquityCurvePanel';
import LiveLogsPanel from '../components/dashboard/LiveLogsPanel';

export default function DashboardScreen() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Left - System Heartbeat */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SystemHeartbeatCard />
        </div>

        {/* Top Right - Equity Curve */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <EquityCurvePanel />
        </div>

        {/* Bottom Wide - Live Logs */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 lg:col-span-2">
          <LiveLogsPanel />
        </div>
      </div>
    </div>
  );
}
