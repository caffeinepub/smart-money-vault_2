import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGetBotProfile } from '../../hooks/useUplink';
import { useFetchSignalsTest } from '../../hooks/useFetchSignalsTest';
import { Terminal, Loader2, Radio } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function LiveLogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { data: botProfile } = useGetBotProfile();
  const fetchMutation = useFetchSignalsTest();

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    setLogs((prev) => [...prev.slice(-9), { timestamp, message, type }]);
  };

  useEffect(() => {
    addLog('Terminal initialized...', 'info');
    
    const interval = setInterval(() => {
      const status = botProfile?.uplinkStatus ? 'ACTIVE' : 'STANDBY';
      addLog(`Ping... [OK] | Uplink: [${status}]`, 'info');
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [botProfile?.uplinkStatus]);

  const handleConnectivityTest = async () => {
    addLog('Initiating connectivity test...', 'info');
    try {
      await fetchMutation.mutateAsync();
      addLog('Connectivity test PASSED', 'success');
    } catch (error) {
      addLog('Connectivity test FAILED', 'error');
    }
  };

  return (
    <div className="h-full rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-medium tracking-tight text-white/70">Live Pulse</h2>
        </div>
        <Button
          onClick={handleConnectivityTest}
          disabled={fetchMutation.isPending}
          size="sm"
          variant="outline"
          className="border-white/10 text-white/70 hover:bg-white/5"
        >
          {fetchMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Radio className="mr-2 h-3.5 w-3.5" />
              Test Connection
            </>
          )}
        </Button>
      </div>

      {/* Terminal Window */}
      <div className="rounded-lg border border-white/5 bg-[#0A0A0A] p-4 font-mono text-xs">
        <div className="space-y-1">
          {logs.length === 0 ? (
            <p className="text-white/30">Waiting for logs...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex gap-3">
                <span className="text-white/30">{log.timestamp}</span>
                <span
                  className={cn(
                    log.type === 'success' && 'text-profit',
                    log.type === 'error' && 'text-loss',
                    log.type === 'info' && 'text-white/70'
                  )}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
