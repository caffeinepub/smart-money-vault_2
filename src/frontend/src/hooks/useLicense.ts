import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import type { License } from '../backend';

export function useGetMyLicenseStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<License | null>({
    queryKey: ['myLicenseStatus'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyLicenseStatus();
    },
    enabled: !!actor && !isFetching,
  });
}
