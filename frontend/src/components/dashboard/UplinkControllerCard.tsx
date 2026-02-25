import { useGetBotProfile, useToggleUplink } from '../../hooks/useUplink';
import { Switch } from '@/components/ui/switch';
import { Power, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CardSkeleton } from '../common/LoadingSkeletons';
import { StateMessage } from '../common/StateMessage';

export default function UplinkControllerCard() {
  const { data: botProfile, isLoading, isError, refetch } = useGetBotProfile();
  const toggleUplink = useToggleUplink();

  const isActive = botProfile?.uplinkStatus ?? false;

  const handleToggle = async () => {
    await toggleUplink.mutateAsync(!isActive);
  };

  if (isLoading) {
    return <CardSkeleton />;
  }

  if (isError) {
    return (
      <div className="h-full rounded-xl border border-white/5 bg-[#121212] p-6">
        <StateMessage
          variant="error"
          title="Failed to Load"
          description="Unable to fetch uplink controller status."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      </div>
    );
  }

  return (
    <div id="uplink-controller-card" className="h-full rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight text-white/70">Uplink Controller</h2>
        <Power className="h-4 w-4 text-white/40" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-white">
              {isActive ? 'EXECUTE' : 'STANDBY'}
            </p>
            <p className="text-xs text-white/50">
              {isActive ? 'Bot is actively trading' : 'Bot is on standby'}
            </p>
          </div>
          <div className="relative">
            <div
              className={cn(
                'h-3 w-3 rounded-full transition-all',
                isActive ? 'bg-profit' : 'bg-white/20'
              )}
            />
            {isActive && (
              <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-profit opacity-75" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0A0A0A] p-4">
          <span className="text-sm font-medium text-white">Toggle Uplink</span>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={toggleUplink.isPending}
            className="data-[state=checked]:bg-profit"
          />
        </div>

        {toggleUplink.isPending && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-white/40" />
          </div>
        )}
      </div>
    </div>
  );
}
