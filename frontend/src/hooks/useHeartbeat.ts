import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import type { HeartbeatData, AccountId } from '../backend';

export function useGetHeartbeatData(accountId: AccountId) {
  const { actor, isFetching } = useActor();

  return useQuery<HeartbeatData>({
    queryKey: ['heartbeat', accountId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHeartbeatData(accountId);
    },
    enabled: !!actor && !isFetching && !!accountId,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
