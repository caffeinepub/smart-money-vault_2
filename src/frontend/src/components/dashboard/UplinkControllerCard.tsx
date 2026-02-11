import { useGetBotProfile, useToggleUplink } from '../../hooks/useUplink';
import { Switch } from '@/components/ui/switch';
import { Loader2, Radio } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function UplinkControllerCard() {
  const { data: botProfile, isLoading } = useGetBotProfile();
  const toggleMutation = useToggleUplink();

  const uplinkActive = botProfile?.uplinkStatus ?? false;

  const handleToggle = () => {
    toggleMutation.mutate(!uplinkActive);
  };

  return (
    <div className="h-full rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight text-white/70">Uplink Controller</h2>
        <Radio className="h-4 w-4 text-white/40" />
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          {/* Status Indicator */}
          <div className="relative">
            <div
              className={cn(
                'h-24 w-24 rounded-full border-4 transition-all duration-500',
                uplinkActive
                  ? 'border-profit bg-profit/10 shadow-[0_0_30px_rgba(52,211,153,0.3)]'
                  : 'border-white/10 bg-white/5'
              )}
            >
              <div className="flex h-full items-center justify-center">
                <div
                  className={cn(
                    'h-12 w-12 rounded-full transition-all duration-500',
                    uplinkActive ? 'bg-profit' : 'bg-white/20'
                  )}
                />
              </div>
            </div>
            
            {/* Animated Pulse Ring */}
            {uplinkActive && (
              <div className="absolute inset-0 h-24 w-24 animate-ping rounded-full border-4 border-profit opacity-20" />
            )}
          </div>

          {/* Status Text */}
          <div className="text-center">
            <p
              className={cn(
                'text-lg font-medium tracking-tight transition-colors',
                uplinkActive ? 'text-profit' : 'text-white/40'
              )}
            >
              {uplinkActive ? 'UPLINK ESTABLISHED' : 'SYSTEM STANDBY'}
            </p>
            <p className="mt-1 text-xs text-white/40">
              {uplinkActive ? 'Bot is authorized to execute trades' : 'Bot is in monitoring mode only'}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className={cn('text-sm font-medium', !uplinkActive && 'text-white/70')}>
              OFF
            </span>
            <Switch
              checked={uplinkActive}
              onCheckedChange={handleToggle}
              disabled={toggleMutation.isPending}
              className="data-[state=checked]:bg-profit"
            />
            <span className={cn('text-sm font-medium', uplinkActive && 'text-profit')}>
              ON
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
