import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const tiers = [
  {
    name: 'Paper Hand',
    price: 'Free',
    description: 'View-only, delayed data',
    features: ['Read-only dashboard', 'Delayed market data', 'Basic analytics', 'Community support'],
  },
  {
    name: 'Diamond Hand',
    price: '$50/mo',
    description: 'Live Trading, SaaS License Active',
    features: ['Real-time trading', 'Live market data', 'Advanced analytics', 'Priority support'],
    popular: true,
  },
  {
    name: 'Whale',
    price: '$500/mo',
    description: 'Priority execution, Concierge support',
    features: ['Priority execution', 'Dedicated support', 'Custom strategies', 'API access'],
  },
];

export default function SubscriptionPanel() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            'relative rounded-xl border p-6 backdrop-blur-xl',
            tier.popular
              ? 'border-profit/30 bg-profit/5'
              : 'border-white/5 bg-[#121212]/80'
          )}
        >
          {tier.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-profit px-3 py-1 text-xs font-medium text-black">
                Popular
              </span>
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-1 text-xl font-medium tracking-tight text-white">{tier.name}</h3>
            <p className="mb-4 text-sm text-white/50">{tier.description}</p>
            <div className="text-3xl font-medium text-white">{tier.price}</div>
          </div>

          <ul className="space-y-3">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-profit" />
                <span className="text-sm text-white/70">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
