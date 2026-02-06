import { useActor } from './useActor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProfile } from '../backend';

export function useLinkBotPublicKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicKey: Uint8Array) => {
      if (!actor) throw new Error('Actor not available');
      
      // Get current profile
      const currentProfile = await actor.getCallerUserProfile();
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      // Update profile with bot public key
      const updatedProfile: UserProfile = {
        name: currentProfile.name,
        accountId: currentProfile.accountId,
        planTier: currentProfile.planTier,
        botPublicKey: publicKey,
        bot_id: currentProfile.bot_id,
      };

      return actor.saveCallerUserProfile(updatedProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
