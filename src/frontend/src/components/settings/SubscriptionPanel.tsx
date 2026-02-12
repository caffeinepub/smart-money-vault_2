import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useListTiers } from '../../hooks/useTiers';

export default function SubscriptionPanel() {
  const { data: tiers, isLoading } = useListTiers();

  if (isLoading) {
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {sortedTiers.map((tier) => {
        const isPopular = tier.id === popularTierId;
        const priceDisplay = tier.priceInCents === BigInt(0)
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

            <ul className="space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start space-x-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-profit" />
                  <span className="text-sm text-white/70">{feature}</span>
                </li>
              ))}
            </ul>

            {!tier.active && (
              <div className="mt-4 text-xs text-white/40">
                Currently unavailable
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
