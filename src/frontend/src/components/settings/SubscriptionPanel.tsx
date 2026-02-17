import { useState } from 'react';
import { CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useListTiers } from '../../hooks/useTiers';
import { useIsStripeConfigured, useCreateCheckoutSession } from '../../hooks/useStripe';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { useToast } from '../common/ToastProvider';
import StripeConfigModal from './StripeConfigModal';
import type { ShoppingItem } from '../../backend';

export default function SubscriptionPanel() {
  const { data: tiers, isLoading } = useListTiers();
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const { identity } = useInternetIdentity();
  const createCheckout = useCreateCheckoutSession();
  const { showToast } = useToast();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [processingTierId, setProcessingTierId] = useState<string | null>(null);

  const isAdmin = identity !== null; // Simplified; in production, check actual admin role

  const handleSubscribe = async (tierId: string, tierName: string, priceInCents: bigint) => {
    if (priceInCents === BigInt(0)) {
      showToast('info', 'Free tier is already active');
      return;
    }

    if (!isStripeConfigured) {
      showToast('error', 'Stripe is not configured. Please configure it first.');
      return;
    }

    setProcessingTierId(tierId);

    try {
      const items: ShoppingItem[] = [
        {
          productName: `${tierName} Subscription`,
          productDescription: `Monthly subscription to ${tierName} tier`,
          priceInCents: priceInCents,
          quantity: BigInt(1),
          currency: 'usd',
        },
      ];

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;

      const session = await createCheckout.mutateAsync({
        items,
        successUrl,
        cancelUrl,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error: any) {
      showToast('error', error.message || 'Failed to create checkout session');
      setProcessingTierId(null);
    }
  };

  if (isLoading || stripeConfigLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-profit" />
      </div>
    );
  }

  if (!tiers || tiers.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#121212]/80 p-8 text-center backdrop-blur-xl">
        <p className="text-white/50">No subscription tiers available</p>
      </div>
    );
  }

  // Sort tiers by price for consistent display
  const sortedTiers = [...tiers].sort((a, b) => Number(a.priceInCents) - Number(b.priceInCents));

  // Determine which tier is "popular" (middle tier or Pro tier)
  const popularTierId = sortedTiers.length === 3 ? sortedTiers[1].id : 'pro';

  return (
    <>
      {!isStripeConfigured && isAdmin && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-xl">
          <p className="mb-3 text-sm text-amber-200/90">
            Stripe is not configured. Configure it to enable payments.
          </p>
          <Button
            onClick={() => setShowConfigModal(true)}
            size="sm"
            className="bg-amber-500 text-black hover:bg-amber-400"
          >
            Configure Stripe
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {sortedTiers.map((tier) => {
          const isPopular = tier.id === popularTierId;
          const isFree = tier.priceInCents === BigInt(0);
          const priceDisplay = isFree
            ? 'Free'
            : `$${(Number(tier.priceInCents) / 100).toFixed(0)}/mo`;

          // Build description from limits
          const limits: string[] = [];
          if (tier.maxBots !== undefined && tier.maxBots !== null) {
            limits.push(`${tier.maxBots} bot${Number(tier.maxBots) === 1 ? '' : 's'}`);
          } else {
            limits.push('Unlimited bots');
          }
          if (tier.maxApiCalls !== undefined && tier.maxApiCalls !== null) {
            limits.push(`${Number(tier.maxApiCalls).toLocaleString()} API calls`);
          } else {
            limits.push('Unlimited API calls');
          }
          const description = limits.join(', ');

          const isProcessing = processingTierId === tier.id;

          return (
            <div
              key={tier.id}
              className={cn(
                'relative rounded-xl border p-6 backdrop-blur-xl',
                isPopular
                  ? 'border-profit/30 bg-profit/5'
                  : 'border-white/5 bg-[#121212]/80',
                !tier.active && 'opacity-50'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-profit px-3 py-1 text-xs font-medium text-black">
                    Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-1 text-xl font-medium tracking-tight text-white">{tier.name}</h3>
                <p className="mb-4 text-sm text-white/50">{description}</p>
                <div className="text-3xl font-medium text-white">{priceDisplay}</div>
              </div>

              <ul className="mb-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-profit" />
                    <span className="text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.active && !isFree && (
                <Button
                  onClick={() => handleSubscribe(tier.id, tier.name, tier.priceInCents)}
                  disabled={isProcessing || !isStripeConfigured}
                  className="w-full bg-profit text-black hover:bg-profit/90 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscribe
                    </>
                  )}
                </Button>
              )}

              {!tier.active && (
                <div className="mt-4 text-xs text-white/40">Currently unavailable</div>
              )}
            </div>
          );
        })}
      </div>

      {showConfigModal && <StripeConfigModal onClose={() => setShowConfigModal(false)} />}
    </>
  );
}
