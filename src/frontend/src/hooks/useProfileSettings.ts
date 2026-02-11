import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../backend';
import { useToast } from '../components/common/ToastProvider';
import { normalizeActorError } from '../utils/actorErrorMessage';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.update_profile(profile);
    },
    onMutate: async (newProfile) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currentUserProfile'] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile | null>(['currentUserProfile']);

      // Optimistically update to the new value
      queryClient.setQueryData<UserProfile | null>(['currentUserProfile'], newProfile);

      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    onError: (error, _newProfile, context) => {
      // Rollback to the previous value on error
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(['currentUserProfile'], context.previousProfile);
      }
      showToast('error', normalizeActorError(error));
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      showToast('success', 'Profile updated successfully');
    },
  });
}
