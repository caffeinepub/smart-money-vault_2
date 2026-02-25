import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useSetStripeConfiguration } from '../../hooks/useStripe';
import { useToast } from '../common/ToastProvider';
import type { StripeConfiguration } from '../../backend';

interface StripeConfigModalProps {
  onClose: () => void;
}

export default function StripeConfigModal({ onClose }: StripeConfigModalProps) {
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');
  const [errors, setErrors] = useState<{ secretKey?: string; countries?: string }>({});
  const setConfig = useSetStripeConfiguration();
  const { showToast } = useToast();

  const validateInputs = (): boolean => {
    const newErrors: { secretKey?: string; countries?: string } = {};

    if (!secretKey.trim()) {
      newErrors.secretKey = 'Secret key is required';
    } else if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
      newErrors.secretKey = 'Secret key must start with sk_test_ or sk_live_';
    }

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (allowedCountries.length === 0) {
      newErrors.countries = 'Please enter at least one valid 2-letter country code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    const config: StripeConfiguration = {
      secretKey: secretKey.trim(),
      allowedCountries,
    };

    try {
      await setConfig.mutateAsync(config);
      showToast('success', 'Stripe configured successfully');
      onClose();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to configure Stripe');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass relative w-full max-w-md rounded-xl border border-white/10 bg-charcoal-900/90 p-6 shadow-2xl backdrop-blur-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white/80"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-xl font-medium text-white">Configure Stripe</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="secretKey" className="text-white/70">
              Stripe Secret Key
            </Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => {
                setSecretKey(e.target.value);
                setErrors((prev) => ({ ...prev, secretKey: undefined }));
              }}
              placeholder="sk_test_..."
              className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
            {errors.secretKey && (
              <p className="mt-1 text-xs text-destructive">{errors.secretKey}</p>
            )}
            <p className="mt-1 text-xs text-white/40">
              Your Stripe secret key (starts with sk_test_ or sk_live_)
            </p>
          </div>

          <div>
            <Label htmlFor="countries" className="text-white/70">
              Allowed Countries
            </Label>
            <Input
              id="countries"
              type="text"
              value={countries}
              onChange={(e) => {
                setCountries(e.target.value);
                setErrors((prev) => ({ ...prev, countries: undefined }));
              }}
              placeholder="US,CA,GB"
              className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
            {errors.countries && (
              <p className="mt-1 text-xs text-destructive">{errors.countries}</p>
            )}
            <p className="mt-1 text-xs text-white/40">
              Comma-separated ISO country codes (e.g., US, CA, GB)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={setConfig.isPending}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={setConfig.isPending}
              className="bg-emerald-500 text-black hover:bg-emerald-600"
            >
              {setConfig.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
