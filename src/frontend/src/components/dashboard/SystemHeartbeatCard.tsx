import { useGetHeartbeatData } from '../../hooks/useHeartbeat';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { Activity, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Status } from '../../backend';
import { cn } from '../../lib/utils';

export default function SystemHeartbeatCard() {
  const { data: userProfile } = useGetCallerUserProfile();
  const accountId = userProfile?.accountId || '';
  const { data: heartbeat, isLoading, isError } = useGetHeartbeatData(accountId);

  const isOnline = heartbeat?.botStatus === Status.ACTIVE;

  return (
    <div className="h-full rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight text-white/70">System Heartbeat</h2>
        <Activity className="h-4 w-4 text-white/40" />
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : isError ? (
        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-white/40">Failed to load status</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cycles Warning Banner */}
          {heartbeat?.cyclesWarning && (
            <div className="flex items-start space-x-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-amber-200">
                {heartbeat.cyclesWarning}
              </p>
            </div>
          )}

          {/* Bot Status with Pulsing Indicator */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">Bot Status</span>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isOnline ? 'bg-profit' : 'bg-loss'
                  )}
                />
                {isOnline && (
                  <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-profit opacity-75" />
                )}
              </div>
              <span className={cn('text-sm font-medium', isOnline ? 'text-profit' : 'text-loss')}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* License Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">License</span>
            <div className="flex items-center space-x-2">
              {heartbeat?.verifiedLicense ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-profit" />
                  <span className="text-sm font-medium text-profit">ACTIVE</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-loss" />
                  <span className="text-sm font-medium text-loss">INACTIVE</span>
                </>
              )}
            </div>
          </div>

          {/* ICP Cycles */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">ICP Cycles</span>
            <span className="text-sm font-medium text-white">
              {heartbeat?.cycles ? Number(heartbeat.cycles).toLocaleString() : 'N/A'}
            </span>
          </div>

          {/* Last Heartbeat */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-sm text-white/50">Last Heartbeat</span>
            <span className="text-sm font-medium text-white/70">
              {heartbeat?.lastHeartbeatAt
                ? new Date(Number(heartbeat.lastHeartbeatAt) / 1_000_000).toLocaleTimeString()
                : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
