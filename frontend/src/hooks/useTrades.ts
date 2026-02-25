import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import type { Trade, AccountId, Time } from '../backend';

export function useGetTradesPaginated(
  accountId: AccountId | null,
  startTime: Time | null,
  endTime: Time | null,
  start: bigint,
  limit: bigint
) {
  const { actor, isFetching } = useActor();

  return useQuery<Trade[]>({
    queryKey: ['trades', accountId, startTime?.toString(), endTime?.toString(), start.toString(), limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTradesPaginated(accountId, startTime, endTime, start, limit);
    },
    enabled: !!actor && !isFetching,
  });
}
