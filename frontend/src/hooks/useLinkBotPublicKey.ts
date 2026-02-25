import { useActor } from './useActor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/common/ToastProvider';
import { normalizeActorError } from '../utils/actorErrorMessage';

export function useLinkBotPublicKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (publicKey: Uint8Array) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerBotPublicKey(publicKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['botProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      showToast('success', 'Bot public key linked successfully');
    },
    onError: (error: unknown) => {
      const message = normalizeActorError(error);
      showToast('error', message);
    },
  });
}
