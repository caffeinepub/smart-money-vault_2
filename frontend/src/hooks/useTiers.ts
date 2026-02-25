import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import type { SubscriptionTier } from '../backend';

export function useListTiers() {
  const { actor, isFetching } = useActor();

  return useQuery<SubscriptionTier[]>({
    queryKey: ['subscriptionTiers'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.list_tiers();
      if (result.__kind__ === 'ok') {
        return result.ok;
      }
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTier(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<SubscriptionTier | null>({
    queryKey: ['subscriptionTier', id],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.get_tier(id);
      if (result.__kind__ === 'ok') {
        return result.ok;
      }
      return null;
    },
    enabled: !!actor && !isFetching && !!id,
  });
}
