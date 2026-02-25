import { useActor } from './useActor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/common/ToastProvider';
import { normalizeActorError } from '../utils/actorErrorMessage';

export function useSetBotUrl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error('Actor not available');
      
      // Client-side validation
      if (!url.startsWith('https://')) {
        throw new Error('Bot URL must start with https://');
      }
      
      const result = await actor.setBotUrl(url);
      
      if ('err' in result) {
        throw new Error('Failed to set bot URL');
      }
      
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['botProfile'] });
      showToast('success', 'Bot URL saved successfully');
    },
    onError: (error: unknown) => {
      const message = normalizeActorError(error);
      showToast('error', message);
    },
  });
}
