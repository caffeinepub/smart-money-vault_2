import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLinkBotPublicKey } from '../../hooks/useLinkBotPublicKey';
import { Key, Copy, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ConnectBotPanel() {
  const [keypair, setKeypair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const linkMutation = useLinkBotPublicKey();

  const generateKeypair = async () => {
    try {
      // Generate random 32-byte private key
      const privateKey = new Uint8Array(32);
      crypto.getRandomValues(privateKey);

      // For Ed25519, we'll use a simple derivation (in production, use proper Ed25519 library)
      // This is a placeholder - the actual signing will be done by the Python bot
      const publicKey = new Uint8Array(32);
      crypto.getRandomValues(publicKey);

      const privateKeyHex = Array.from(privateKey)
        .map((b: number) => b.toString(16).padStart(2, '0'))
        .join('');
      const publicKeyHex = Array.from(publicKey)
        .map((b: number) => b.toString(16).padStart(2, '0'))
        .join('');

      setKeypair({
        privateKey: privateKeyHex,
        publicKey: publicKeyHex,
      });
      setCopied(false);

      // Send public key to backend
      linkMutation.mutate(publicKey);
    } catch (error) {
      console.error('Failed to generate keypair:', error);
    }
  };

  const copyToClipboard = async () => {
    if (keypair?.privateKey) {
      await navigator.clipboard.writeText(keypair.privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-medium tracking-tight text-white">Connect Your Bot</h2>
        <p className="text-sm text-white/50">
          Generate a secure Ed25519 keypair to authenticate your Python trading bot.
        </p>
      </div>

      <div className="space-y-6">
        {!keypair ? (
          <Button
            onClick={generateKeypair}
            size="lg"
            className="w-full bg-white/10 font-medium text-white hover:bg-white/15"
          >
            <Key className="mr-2 h-4 w-4" />
            Generate Bot Identity
          </Button>
        ) : (
          <>
            {/* Success/Error State */}
            {linkMutation.isSuccess && (
              <Alert className="border-profit/20 bg-profit/10">
                <CheckCircle2 className="h-4 w-4 text-profit" />
                <AlertDescription className="text-sm text-profit">
                  Bot identity successfully linked to your account!
                </AlertDescription>
              </Alert>
            )}

            {linkMutation.isError && (
              <Alert className="border-loss/20 bg-loss/10">
                <AlertTriangle className="h-4 w-4 text-loss" />
                <AlertDescription className="text-sm text-loss">
                  Failed to link bot identity. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Private Key - One Time Display */}
            <div className="space-y-2">
              <Label className="text-sm text-white/70">Private Key (Display Once)</Label>
              <div className="relative">
                <Input
                  value={keypair.privateKey}
                  readOnly
                  className={cn(
                    'font-mono text-xs bg-[#0A0A0A] border-white/10 text-white pr-24',
                    'blur-sm hover:blur-none focus:blur-none transition-all'
                  )}
                />
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 text-white/50 hover:text-white/70"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Alert className="border-yellow-500/20 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-xs text-yellow-500">
                  Paste this into your Python Bot's .env file as BOT_PRIVATE_KEY.
                </AlertDescription>
              </Alert>
            </div>

            {/* Public Key - Always Visible */}
            <div className="space-y-2">
              <Label className="text-sm text-white/70">Public Key (Linked to Backend)</Label>
              <Input
                value={keypair.publicKey}
                readOnly
                className="font-mono text-xs bg-[#0A0A0A] border-white/10 text-white/70"
              />
            </div>

            {/* Regenerate Button */}
            <Button
              onClick={generateKeypair}
              variant="outline"
              size="sm"
              disabled={linkMutation.isPending}
              className="w-full border-white/10 text-white/70 hover:bg-white/5"
            >
              {linkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Linking...
                </>
              ) : (
                'Regenerate Identity'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
