import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import { useGetCallerUserProfile } from './useCurrentUserProfile';
import type { Trade } from '../backend';

export function useGetLiveLogs() {
  const { actor, isFetching } = useActor();
  const { data: userProfile } = useGetCallerUserProfile();
  const accountId = userProfile?.accountId || null;

  return useQuery<Trade[]>({
    queryKey: ['liveLogs', accountId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTradesPaginated(accountId, null, null, 0n, 50n);
    },
    enabled: !!actor && !isFetching && !!accountId,
    refetchInterval: 5000, // Refresh every 5 seconds for live feed
  });
}
