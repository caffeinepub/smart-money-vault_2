import { useActor } from './useActor';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../components/common/ToastProvider';
import { normalizeActorError } from '../utils/actorErrorMessage';

export function useFetchSignalsTest() {
  const { actor } = useActor();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.fetchSignals();
      
      if ('err' in result) {
        // Handle discriminated union properly
        const errorMessage = result.err.__kind__ === 'FetchFailed' 
          ? result.err.FetchFailed 
          : result.err.__kind__ === 'InvalidUrl'
          ? result.err.InvalidUrl
          : 'Fetch failed';
        throw new Error(errorMessage);
      }
      
      return result.ok;
    },
    onSuccess: (payload) => {
      const bodyLength = payload.body.length;
      const statusCode = payload.statusCode;
      showToast('success', `Connectivity test passed. Status ${statusCode}, received ${bodyLength} characters.`);
      return payload;
    },
    onError: (error: unknown) => {
      const message = normalizeActorError(error);
      showToast('error', `Connectivity test failed: ${message}`);
    },
  });
}
