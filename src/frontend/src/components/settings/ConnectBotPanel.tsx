import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGetBotProfile } from '../../hooks/useUplink';
import ConnectBotWizardModal from './ConnectBotWizardModal';
import { Key, CheckCircle2 } from 'lucide-react';
import { CardSkeleton } from '../common/LoadingSkeletons';

export default function ConnectBotPanel() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { data: botProfile, isLoading } = useGetBotProfile();

  const hasPublicKey = !!botProfile?.publicKey;
  const hasBotUrl = !!botProfile?.botUrl;

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <>
      <div className="glass rounded-xl border border-white/5 bg-charcoal-900/80 p-6 backdrop-blur-md">
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold tracking-tight text-white">Connect Your Bot</h2>
          <p className="text-sm leading-relaxed text-white/60">
            Generate a secure Ed25519 keypair and configure your Python trading bot endpoint.
          </p>
        </div>

        <div className="space-y-6">
          {(hasPublicKey || hasBotUrl) && (
            <div className="space-y-3 rounded-lg border border-white/5 bg-charcoal-950/80 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/60">Bot Public Key</span>
                {hasPublicKey ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-500">Linked</span>
                  </div>
                ) : (
                  <span className="text-sm text-white/40">Not configured</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/60">Bot HTTPS URL</span>
                {hasBotUrl ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-500">Configured</span>
                  </div>
                ) : (
                  <span className="text-sm text-white/40">Not configured</span>
                )}
              </div>

              {hasBotUrl && botProfile?.botUrl && (
                <div className="pt-2 border-t border-white/5">
                  <p className="font-mono text-xs text-white/40 break-all">{botProfile.botUrl}</p>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={() => setWizardOpen(true)}
            size="lg"
            className="w-full bg-emerald-500 font-medium text-black hover:bg-emerald-600"
          >
            <Key className="mr-2 h-4 w-4" />
            {hasPublicKey ? 'Reconfigure Bot' : 'Connect Bot'}
          </Button>
        </div>
      </div>

      <ConnectBotWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  );
}
