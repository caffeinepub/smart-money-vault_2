import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/common/ToastProvider';
import { normalizeActorError } from '../utils/actorErrorMessage';
import type { BotProfile } from '../backend';

export function useGetBotProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<BotProfile | null>({
    queryKey: ['botProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBotProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useToggleUplink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (state: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggle_uplink(state);
    },
    onSuccess: (_, state) => {
      queryClient.invalidateQueries({ queryKey: ['botProfile'] });
      showToast('success', state ? 'Uplink CONNECTED' : 'Uplink DISCONNECTED');
    },
    onError: (error: unknown) => {
      const message = normalizeActorError(error);
      showToast('error', message);
    },
  });
}
