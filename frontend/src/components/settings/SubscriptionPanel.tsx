import { useState, useEffect } from 'react';
import { CheckCircle2, CreditCard, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useListTiers } from '../../hooks/useTiers';
import { useIsStripeConfigured, useCreateCheckoutSession } from '../../hooks/useStripe';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useIsCallerAdmin } from '../../hooks/useAdmin';
import { Button } from '../ui/button';
import { useToast } from '../common/ToastProvider';
import StripeConfigModal from './StripeConfigModal';
import { Variant_Pro_Free_Whale } from '../../backend';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useStoreAnalyticsEvent } from '../../hooks/useBackendAnalytics';
import { EventType } from '../../backend';
import { CardSkeleton } from '../common/LoadingSkeletons';
import { StateMessage } from '../common/StateMessage';
import { useOnboardingTour } from '../tour/OnboardingTourProvider';
import type { ShoppingItem, SubscriptionTier } from '../../backend';
import type { TourStep } from '../tour/types';

const SUPPORT_FEATURES_DENYLIST = [
  'Community support',
  'Priority support',
  'Dedicated support',
];

function filterSupportFeatures(features: string[]): string[] {
  return features.filter((feature) => {
    const normalized = feature.trim();
    return !SUPPORT_FEATURES_DENYLIST.some(
      (denied) => normalized.toLowerCase() === denied.toLowerCase()
    );
  });
}

const FALLBACK_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Paper Hand',
    maxBots: BigInt(1),
    maxApiCalls: BigInt(1000),
    priceInCents: BigInt(0),
    features: [
      'Read-only dashboard',
      'Delayed market data',
      'Basic analytics',
      'Community support',
    ],
    active: true,
  },
  {
    id: 'pro',
    name: 'Diamond Hand',
    maxBots: BigInt(5),
    maxApiCalls: BigInt(50000),
    priceInCents: BigInt(5000),
    features: [
      'Real-time trading',
      'Live market data',
      'Advanced analytics',
      'Priority support',
    ],
    active: true,
  },
  {
    id: 'whale',
    name: 'Whale',
    maxBots: BigInt(999999),
    maxApiCalls: BigInt(999999),
    priceInCents: BigInt(50000),
    features: [
      'Priority execution',
      'Dedicated support',
      'Custom strategies',
      'API access',
    ],
    active: true,
  },
];

const TOUR_STEPS: TourStep[] = [
  {
    id: 'subscription-tiers',
    screen: 'settings',
    targetId: 'subscription-tiers-grid',
    title: 'Subscription Tiers',
    description: 'Choose a plan that fits your trading needs. Click Subscribe to upgrade via Stripe checkout.',
    placement: 'top',
  },
];

export default function SubscriptionPanel() {
  const { data: tiers, isLoading: tiersLoading, isError: tiersError } = useListTiers();
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { identity } = useInternetIdentity();
  const createCheckout = useCreateCheckoutSession();
  const { showToast } = useToast();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [processingTierId, setProcessingTierId] = useState<string | null>(null);
  const { recordEvent } = useAnalytics();
  const storeBackendEvent = useStoreAnalyticsEvent();
  const { registerSteps } = useOnboardingTour();

  useEffect(() => {
    registerSteps(TOUR_STEPS);
  }, [registerSteps]);

  const handleSubscribe = async (tierId: string, tierName: string, priceInCents: bigint) => {
    if (!identity) {
      showToast('error', 'Please log in to subscribe');
      return;
    }

    if (priceInCents === BigInt(0)) {
      showToast('info', 'You are already on the free tier');
      return;
    }

    if (!isStripeConfigured) {
      showToast('error', 'Payment processing is not yet configured');
      return;
    }

    setProcessingTierId(tierId);

    recordEvent('stripe', `checkout-${tierId}`, `Started checkout for ${tierName}`);
    storeBackendEvent.mutate({
      eventType: EventType.Stripe,
      elementId: `checkout-${tierId}`,
      count: 1,
      payload: `Started checkout for ${tierName}`,
    });

    try {
      const description = `Monthly subscription to ${tierName} tier`;

      const items: ShoppingItem[] = [
        {
          productName: tierName,
          productDescription: description,
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

      window.location.href = session.url;
    } catch (error: any) {
      showToast('error', error.message || 'Failed to create checkout session');
      setProcessingTierId(null);
    }
  };

  const isLoading = tiersLoading || stripeConfigLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const displayTiers = (tiers && tiers.length > 0) ? tiers : (tiersError || !tiers) ? FALLBACK_TIERS : [];

  if (displayTiers.length === 0) {
    return (
      <StateMessage
        variant="empty"
        title="No Subscription Tiers"
        description="Subscription tiers are not available at this time."
      />
    );
  }

  const sortedTiers = [...displayTiers].sort((a, b) => Number(a.priceInCents) - Number(b.priceInCents));
  const popularTierId = sortedTiers.length === 3 ? sortedTiers[1].id : 'pro';

  const activeTierId = userProfile?.planTier
    ? userProfile.planTier === Variant_Pro_Free_Whale.Free
      ? 'free'
      : userProfile.planTier === Variant_Pro_Free_Whale.Pro
      ? 'pro'
      : userProfile.planTier === Variant_Pro_Free_Whale.Whale
      ? 'whale'
      : null
    : null;

  return (
    <>
      {!isStripeConfigured && isAdmin && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-xl">
          <p className="mb-3 text-sm leading-relaxed text-amber-200/90">
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

      <div id="subscription-tiers-grid" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedTiers.map((tier) => {
          const isPopular = tier.id === popularTierId;
          const isFree = tier.priceInCents === BigInt(0);
          const isActive = activeTierId === tier.id;
          const priceDisplay = isFree
            ? 'Free'
            : `$${(Number(tier.priceInCents) / 100).toFixed(0)}/mo`;

          const limits: string[] = [];
          if (tier.maxBots !== undefined && tier.maxBots !== null) {
            const maxBots = Number(tier.maxBots);
            if (maxBots >= 999999) {
              limits.push('Unlimited bots');
            } else {
              limits.push(`${maxBots} bot${maxBots === 1 ? '' : 's'}`);
            }
          } else {
            limits.push('Unlimited bots');
          }
          if (tier.maxApiCalls !== undefined && tier.maxApiCalls !== null) {
            const maxCalls = Number(tier.maxApiCalls);
            if (maxCalls >= 999999) {
              limits.push('Unlimited API calls');
            } else {
              limits.push(`${maxCalls.toLocaleString()} API calls`);
            }
          } else {
            limits.push('Unlimited API calls');
          }
          const description = limits.join(', ');

          const filteredFeatures = filterSupportFeatures(tier.features);

          const isProcessing = processingTierId === tier.id;

          return (
            <div
              key={tier.id}
              className={cn(
                'relative flex flex-col rounded-xl border p-6 backdrop-blur-xl',
                isActive && 'ring-2 ring-profit ring-offset-2 ring-offset-[#050505]',
                isPopular && !isActive
                  ? 'border-profit/30 bg-profit/5'
                  : 'border-white/5 bg-[#121212]/80',
                !tier.active && 'opacity-50'
              )}
            >
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center space-x-1 rounded-full bg-profit px-3 py-1 text-xs font-medium text-black">
                    <Crown className="h-3 w-3" />
                    <span>Current Plan</span>
                  </span>
                </div>
              )}
              {isPopular && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-profit px-3 py-1 text-xs font-medium text-black">
                    Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-1 text-xl font-semibold tracking-tight text-white">{tier.name}</h3>
                <p className="mb-4 text-sm leading-relaxed text-white/60">{description}</p>
                <div className="text-3xl font-semibold text-white">{priceDisplay}</div>
              </div>

              <ul className="mb-6 flex-1 space-y-3">
                {filteredFeatures.map((feature) => (
                  <li key={feature} className="flex items-start space-x-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-profit" />
                    <span className="text-sm leading-relaxed text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {isFree ? (
                <div className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/70">
                  Current Plan
                </div>
              ) : isActive ? (
                <div className="flex items-center justify-center rounded-lg border border-profit/30 bg-profit/10 py-3 text-sm font-medium text-profit">
                  <Crown className="mr-2 h-4 w-4" />
                  Current Plan
                </div>
              ) : (
                <Button
                  onClick={() => handleSubscribe(tier.id, tier.name, tier.priceInCents)}
                  disabled={!tier.active || !isStripeConfigured || isProcessing}
                  className={cn(
                    'w-full bg-profit text-black hover:bg-profit/90',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
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
                <div className="mt-2 text-center text-xs text-white/40">Currently unavailable</div>
              )}
            </div>
          );
        })}
      </div>

      {!isStripeConfigured && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
          <p className="text-sm leading-relaxed text-white/60">
            Payment processing is being configured. Check back soon.
          </p>
        </div>
      )}

      {showConfigModal && <StripeConfigModal onClose={() => setShowConfigModal(false)} />}
    </>
  );
}
