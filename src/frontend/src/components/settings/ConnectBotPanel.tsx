import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGetBotProfile } from '../../hooks/useUplink';
import ConnectBotWizardModal from './ConnectBotWizardModal';
import { Key, CheckCircle2, Loader2 } from 'lucide-react';

export default function ConnectBotPanel() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { data: botProfile, isLoading } = useGetBotProfile();

  const hasPublicKey = !!botProfile?.publicKey;
  const hasBotUrl = !!botProfile?.botUrl;

  return (
    <>
      <div className="rounded-xl border border-white/5 bg-[#121212] p-6">
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-medium tracking-tight text-white">Connect Your Bot</h2>
          <p className="text-sm text-white/50">
            Generate a secure Ed25519 keypair and configure your Python trading bot endpoint.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Display */}
            {(hasPublicKey || hasBotUrl) && (
              <div className="space-y-3 rounded-lg border border-white/5 bg-[#0A0A0A] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Bot Public Key</span>
                  {hasPublicKey ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-profit" />
                      <span className="text-sm font-medium text-profit">Linked</span>
                    </div>
                  ) : (
                    <span className="text-sm text-white/40">Not configured</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Bot HTTPS URL</span>
                  {hasBotUrl ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-profit" />
                      <span className="text-sm font-medium text-profit">Configured</span>
                    </div>
                  ) : (
                    <span className="text-sm text-white/40">Not configured</span>
                  )}
                </div>

                {hasBotUrl && botProfile?.botUrl && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-white/40 break-all">{botProfile.botUrl}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={() => setWizardOpen(true)}
              size="lg"
              className="w-full bg-profit font-medium text-black hover:bg-profit/90"
            >
              <Key className="mr-2 h-4 w-4" />
              {hasPublicKey ? 'Reconfigure Bot' : 'Connect Bot'}
            </Button>
          </div>
        )}
      </div>

      <ConnectBotWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  );
}
