import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import type { AuditEntry } from '../backend';

export function useGetAuditLog(limit: number = 50) {
  const { actor, isFetching } = useActor();

  return useQuery<AuditEntry[]>({
    queryKey: ['auditLog', limit],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAuditLog(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
