import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { License, AccountId } from '../backend';

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllLicenses() {
  const { actor, isFetching } = useActor();

  return useQuery<[AccountId, License][]>({
    queryKey: ['allLicenses'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllLicenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrUpdateLicense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, active }: { accountId: AccountId; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateLicense(accountId, active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLicenses'] });
      queryClient.invalidateQueries({ queryKey: ['myLicenseStatus'] });
    },
  });
}

export function useRevokeLicense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: AccountId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.revokeLicense(accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLicenses'] });
      queryClient.invalidateQueries({ queryKey: ['myLicenseStatus'] });
    },
  });
}
