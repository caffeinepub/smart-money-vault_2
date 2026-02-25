import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ShoppingItem, StripeConfiguration, StripeSessionStatus } from '../backend';

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: {
      items: ShoppingItem[];
      successUrl: string;
      cancelUrl: string;
    }): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(
        params.items,
        params.successUrl,
        params.cancelUrl
      );
      // JSON parsing is important!
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useGetStripeSessionStatus(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StripeSessionStatus>({
    queryKey: ['stripeSessionStatus', sessionId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    retry: false,
  });
}
