import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { EventType, AnalyticsEvent } from '../backend';

export function useGetAnalyticsEvents(limit: number = 50) {
  const { actor, isFetching } = useActor();

  return useQuery<AnalyticsEvent[]>({
    queryKey: ['analyticsEvents', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnalyticsEvents(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStoreAnalyticsEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      eventType,
      elementId,
      count,
      payload,
    }: {
      eventId?: string;
      eventType: EventType;
      elementId: string;
      count: number;
      payload?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.storeAnalyticsEvent(
        eventId || null,
        eventType,
        elementId,
        BigInt(count),
        payload || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsEvents'] });
    },
  });
}
