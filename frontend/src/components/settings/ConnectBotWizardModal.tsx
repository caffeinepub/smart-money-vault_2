import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLinkBotPublicKey } from '../../hooks/useLinkBotPublicKey';
import { useSetBotUrl } from '../../hooks/useSetBotUrl';
import { Key, Copy, CheckCircle2, AlertTriangle, Loader2, ArrowRight, ArrowLeft, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConnectBotWizardModalProps {
  open: boolean;
  onClose: () => void;
}

type WizardStep = 'generate' | 'reveal' | 'link' | 'url' | 'done' | 'error';

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
    
    throw new Error('Failed to extract private key from Web Crypto API');
  } catch (error) {
    console.error('Web Crypto Ed25519 generation failed:', error);
    throw new Error(
      'Ed25519 key generation is not supported in your browser. ' +
      'Please use a modern browser: Chrome 93+, Firefox 119+, Safari 17+, or Edge 93+.'
    );
  }
}

export default function ConnectBotWizardModal({ open, onClose }: ConnectBotWizardModalProps) {
  const [step, setStep] = useState<WizardStep>('generate');
  const [keypair, setKeypair] = useState<{ publicKey: Uint8Array; privateKey: string } | null>(null);
  const [botUrl, setBotUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [generationError, setGenerationError] = useState('');
  
  const linkMutation = useLinkBotPublicKey();
  const urlMutation = useSetBotUrl();

  const handleGenerateKeypair = async () => {
    try {
      setGenerationError('');
      const { privateKey, publicKey } = await generateEd25519Keypair();
      
      // Convert private key to hex string for BOT_PRIVATE_KEY
      const privateKeyHex = bytesToHex(privateKey);
      
      setKeypair({ publicKey, privateKey: privateKeyHex });
      setStep('reveal');
    } catch (error: any) {
      console.error('Failed to generate keypair:', error);
      setGenerationError(error.message || 'Failed to generate Ed25519 keypair. Your browser may not support the required cryptographic operations.');
      setStep('error');
    }
  };

  const handleCopyPrivateKey = () => {
    if (keypair) {
      navigator.clipboard.writeText(keypair.privateKey);
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
      console.error('Failed to link public key:', error);
    }
  };

  const handleSaveBotUrl = async () => {
    if (!botUrl.trim()) {
      setUrlError('Please enter a bot URL');
      return;
    }

    if (!botUrl.startsWith('https://')) {
      setUrlError('URL must start with https://');
      return;
    }

    setUrlError('');

    try {
      await urlMutation.mutateAsync(botUrl.trim());
      setStep('done');
    } catch (error: any) {
      setUrlError(error.message || 'Failed to save bot URL');
    }
  };

  const handleClose = () => {
    setStep('generate');
    setKeypair(null);
    setBotUrl('');
    setCopied(false);
    setUrlError('');
    setGenerationError('');
    onClose();
  };

  const handleRetryGeneration = () => {
    setGenerationError('');
    setStep('generate');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass border-white/10 bg-charcoal-900/90 backdrop-blur-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Connect Your Trading Bot</DialogTitle>
          <DialogDescription className="text-white/60">
            Follow these steps to securely link your Python trading bot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {['generate', 'reveal', 'link', 'url', 'done'].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium',
                    step === s
                      ? 'bg-emerald-500 text-black'
                      : ['generate', 'reveal', 'link', 'url', 'done'].indexOf(step) > idx
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-white/5 text-white/40'
                  )}
                >
                  {idx + 1}
                </div>
                {idx < 4 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 w-8',
                      ['generate', 'reveal', 'link', 'url', 'done'].indexOf(step) > idx
                        ? 'bg-emerald-500/40'
                        : 'bg-white/10'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 'generate' && (
            <div className="space-y-4">
              <Alert className="border-emerald-500/20 bg-emerald-500/5">
                <Key className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-white/80">
                  Generate a new Ed25519 keypair for secure bot authentication
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleGenerateKeypair}
                className="w-full bg-emerald-500 text-black hover:bg-emerald-600"
              >
                <Key className="mr-2 h-4 w-4" />
                Generate Keypair
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 rounded-full bg-destructive/10 p-4">
                  <XCircle className="h-12 w-12 text-destructive" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Key Generation Failed</h3>
                <p className="text-center text-sm text-white/60 mb-4 max-w-md">
                  {generationError}
                </p>
                <Alert className="border-amber-500/20 bg-amber-500/5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-white/80">
                    Ed25519 requires a modern browser. Please update to Chrome 93+, Firefox 119+, Safari 17+, or Edge 93+.
                  </AlertDescription>
                </Alert>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRetryGeneration}
                  className="flex-1 bg-emerald-500 text-black hover:bg-emerald-600"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {step === 'reveal' && keypair && (
            <div className="space-y-4">
              <Alert className="border-amber-500/20 bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-white/80">
                  Copy your private key now. You won't be able to see it again!
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label className="text-white/80">Private Key (BOT_PRIVATE_KEY)</Label>
                <div className="relative">
                  <Input
                    value={keypair.privateKey}
                    readOnly
                    className="font-mono border-white/10 bg-charcoal-950/80 pr-10 text-xs text-white"
                  />
                  <button
                    onClick={handleCopyPrivateKey}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-white/40">
                  Store this in your Python bot's environment as BOT_PRIVATE_KEY
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('generate')}
                  variant="outline"
                  className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep('link')}
                  className="flex-1 bg-emerald-500 text-black hover:bg-emerald-600"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'link' && keypair && (
            <div className="space-y-4">
              <Alert className="border-emerald-500/20 bg-emerald-500/5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-white/80">
                  Link the public key to your account for bot authentication
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label className="text-white/80">Public Key</Label>
                <Input
                  value={bytesToHex(keypair.publicKey)}
                  readOnly
                  className="font-mono border-white/10 bg-charcoal-950/80 text-xs text-white"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('reveal')}
                  variant="outline"
                  className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleLinkPublicKey}
                  disabled={linkMutation.isPending}
                  className="flex-1 bg-emerald-500 text-black hover:bg-emerald-600"
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

          {step === 'url' && (
            <div className="space-y-4">
              <Alert className="border-emerald-500/20 bg-emerald-500/5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-white/80">
                  Configure your bot's HTTPS endpoint URL
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="botUrl" className="text-white/80">
                  Bot HTTPS URL
                </Label>
                <Input
                  id="botUrl"
                  value={botUrl}
                  onChange={(e) => {
                    setBotUrl(e.target.value);
                    setUrlError('');
                  }}
                  placeholder="https://your-bot-endpoint.com/api"
                  className="border-white/10 bg-charcoal-950/80 text-white placeholder:text-white/40"
                />
                {urlError && (
                  <p className="text-xs text-destructive">{urlError}</p>
                )}
                <p className="text-xs text-white/40">
                  The HTTPS endpoint where your bot receives signals
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('link')}
                  variant="outline"
                  className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSaveBotUrl}
                  disabled={urlMutation.isPending}
                  className="flex-1 bg-emerald-500 text-black hover:bg-emerald-600"
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

          {step === 'done' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 rounded-full bg-emerald-500/10 p-4">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Bot Connected!</h3>
                <p className="text-center text-sm text-white/60">
                  Your trading bot is now configured and ready to receive signals
                </p>
              </div>
              <Button
                onClick={handleClose}
                className="w-full bg-emerald-500 text-black hover:bg-emerald-600"
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
