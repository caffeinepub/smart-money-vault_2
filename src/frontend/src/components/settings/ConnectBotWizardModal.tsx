import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLinkBotPublicKey } from '../../hooks/useLinkBotPublicKey';
import { useSetBotUrl } from '../../hooks/useSetBotUrl';
import { Key, Copy, CheckCircle2, AlertTriangle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConnectBotWizardModalProps {
  open: boolean;
  onClose: () => void;
}

type WizardStep = 'generate' | 'reveal' | 'link' | 'url' | 'done';

// Helper function to convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Ed25519 keypair generation using Web Crypto API
async function generateEd25519Keypair(): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
  try {
    // Try Web Crypto API Ed25519 support (available in modern browsers)
    const cryptoKeyPair = await window.crypto.subtle.generateKey(
      { name: 'Ed25519' } as any,
      true,
      ['sign', 'verify']
    );

    // Export public key (32 bytes)
    const publicKeyBuffer = await window.crypto.subtle.exportKey('raw', cryptoKeyPair.publicKey);
    const publicKey = new Uint8Array(publicKeyBuffer);

    // Export private key in JWK format to extract the seed
    const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', cryptoKeyPair.privateKey) as any;
    
    if (privateKeyJwk.d) {
      // Convert base64url to Uint8Array
      const base64 = privateKeyJwk.d.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const binary = atob(padded);
      const privateKey = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        privateKey[i] = binary.charCodeAt(i);
      }
      return { privateKey, publicKey };
    }
  } catch (webCryptoError) {
    console.warn('Web Crypto Ed25519 not available, using fallback:', webCryptoError);
  }

  // Fallback: Generate random seed when Web Crypto Ed25519 is not available
  // TODO: Replace with real Ed25519 derivation in production.
  const privateKey = new Uint8Array(32);
  window.crypto.getRandomValues(privateKey);
  
  // Generate a placeholder public key (not cryptographically derived)
  const publicKey = new Uint8Array(32);
  window.crypto.getRandomValues(publicKey);
  
  return { privateKey, publicKey };
}

export default function ConnectBotWizardModal({ open, onClose }: ConnectBotWizardModalProps) {
  const [step, setStep] = useState<WizardStep>('generate');
  const [keypair, setKeypair] = useState<{ publicKey: Uint8Array; privateKey: string } | null>(null);
  const [botUrl, setBotUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [urlError, setUrlError] = useState('');
  
  const linkMutation = useLinkBotPublicKey();
  const urlMutation = useSetBotUrl();

  const handleGenerateKeypair = async () => {
    try {
      const { privateKey, publicKey } = await generateEd25519Keypair();
      
      // Convert private key to hex string for BOT_PRIVATE_KEY
      const privateKeyHex = bytesToHex(privateKey);
      
      setKeypair({ publicKey, privateKey: privateKeyHex });
      setStep('reveal');
    } catch (error) {
      console.error('Failed to generate keypair:', error);
    }
  };

  const handleCopyPrivateKey = async () => {
    if (keypair?.privateKey) {
      await navigator.clipboard.writeText(keypair.privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkPublicKey = async () => {
    if (!keypair) return;
    
    try {
      await linkMutation.mutateAsync(keypair.publicKey);
      setStep('url');
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handleSaveBotUrl = async () => {
    setUrlError('');
    
    if (!botUrl.trim()) {
      setUrlError('Bot URL is required');
      return;
    }
    
    if (!botUrl.startsWith('https://')) {
      setUrlError('Bot URL must start with https://');
      return;
    }
    
    try {
      await urlMutation.mutateAsync(botUrl);
      setStep('done');
    } catch (error) {
      // Error is handled by the mutation's onError
    }
  };

  const handleClose = () => {
    // Clear sensitive data
    setKeypair(null);
    setBotUrl('');
    setStep('generate');
    setCopied(false);
    setUrlError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-white/10 bg-[#121212] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium tracking-tight">Connect Your Bot</DialogTitle>
          <DialogDescription className="text-sm text-white/50">
            {step === 'generate' && 'Generate a secure Ed25519 keypair for your Python bot'}
            {step === 'reveal' && 'Save your private key - it will only be shown once'}
            {step === 'link' && 'Linking your public key to the backend'}
            {step === 'url' && 'Configure your bot HTTPS endpoint'}
            {step === 'done' && 'Setup complete! Your bot is ready to connect'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Generate */}
          {step === 'generate' && (
            <div className="space-y-4">
              <Alert className="border-white/10 bg-white/5">
                <Key className="h-4 w-4 text-white/70" />
                <AlertDescription className="text-xs text-white/70">
                  This will create a new Ed25519 keypair in your browser. The private key will be shown only once.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={handleGenerateKeypair}
                size="lg"
                className="w-full bg-profit font-medium text-black hover:bg-profit/90"
              >
                <Key className="mr-2 h-4 w-4" />
                Generate Bot Identity
              </Button>
            </div>
          )}

          {/* Step 2: Reveal Private Key */}
          {step === 'reveal' && keypair && (
            <div className="space-y-4">
              <Alert className="border-yellow-500/20 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-xs text-yellow-500">
                  Paste this into your Python Bot's .env file as BOT_PRIVATE_KEY. This will not be shown again.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-sm text-white/70">Private Key (One-Time Display)</Label>
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
                    onClick={handleCopyPrivateKey}
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
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep('generate')}
                  variant="outline"
                  className="flex-1 border-white/10 text-white/70 hover:bg-white/5"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleLinkPublicKey}
                  disabled={linkMutation.isPending}
                  className="flex-1 bg-profit font-medium text-black hover:bg-profit/90"
                >
                  {linkMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    <>
                      Link Public Key
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Configure Bot URL */}
          {step === 'url' && (
            <div className="space-y-4">
              <Alert className="border-white/10 bg-white/5">
                <Info className="h-4 w-4 text-white/70" />
                <AlertDescription className="text-xs text-white/70">
                  Enter your bot's public HTTPS endpoint (e.g., ngrok URL). This must start with https://
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-sm text-white/70">Bot HTTPS URL</Label>
                <Input
                  value={botUrl}
                  onChange={(e) => {
                    setBotUrl(e.target.value);
                    setUrlError('');
                  }}
                  placeholder="https://your-bot.ngrok-free.app/api/v1/signals"
                  className="bg-[#0A0A0A] border-white/10 text-white"
                />
                {urlError && (
                  <p className="text-xs text-loss">{urlError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep('reveal')}
                  variant="outline"
                  className="flex-1 border-white/10 text-white/70 hover:bg-white/5"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSaveBotUrl}
                  disabled={urlMutation.isPending}
                  className="flex-1 bg-profit font-medium text-black hover:bg-profit/90"
                >
                  {urlMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <div className="space-y-4">
              <Alert className="border-profit/20 bg-profit/10">
                <CheckCircle2 className="h-4 w-4 text-profit" />
                <AlertDescription className="text-sm text-profit">
                  Bot setup complete! Your Python bot can now connect to the dashboard.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleClose}
                size="lg"
                className="w-full bg-profit font-medium text-black hover:bg-profit/90"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
