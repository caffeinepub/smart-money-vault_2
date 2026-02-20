import { useEffect } from 'react';
import { useGetMyLicenseStatus } from '../hooks/useLicense';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatTimestamp } from '../utils/format';
import { useOnboardingTour } from '../components/tour/OnboardingTourProvider';
import { PageSkeleton } from '../components/common/LoadingSkeletons';
import type { TourStep } from '../components/tour/types';

const TOUR_STEPS: TourStep[] = [
  {
    id: 'overview-license',
    screen: 'overview',
    targetId: 'overview-license-card',
    title: 'License Status',
    description: 'View your current license status, account details, and activation dates.',
    placement: 'bottom',
  },
];

export default function OverviewScreen() {
  const { data: license, isLoading } = useGetMyLicenseStatus();
  const { data: userProfile } = useGetCallerUserProfile();
  const { registerSteps } = useOnboardingTour();

  useEffect(() => {
    registerSteps(TOUR_STEPS);
  }, [registerSteps]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  const hasAccountId = !!userProfile?.accountId;
  const isActive = license?.active ?? false;

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Overview</h2>
          <p className="mt-1 text-sm text-white/60">Your license status and account information</p>
        </div>

        <Card id="overview-license-card" className="border-white/5 bg-[#000000]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white sm:text-lg">License Status</CardTitle>
            <CardDescription className="text-xs text-white/60 sm:text-sm">
              Current status of your trading license
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasAccountId ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-white/60" />
                  <div>
                    <p className="text-sm font-medium text-white sm:text-base">No Account Identifier</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/60 sm:text-sm">
                      You haven't set an account identifier yet. Please contact an administrator to
                      link your account to a license.
                    </p>
                  </div>
                </div>
              </div>
            ) : !license ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-start space-x-3">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ef4444]" />
                  <div>
                    <p className="text-sm font-medium text-white sm:text-base">No License Found</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/60 sm:text-sm">
                      No license is associated with your account identifier:{' '}
                      <span className="break-all font-mono text-white/80">{userProfile.accountId}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                  <span className="text-sm font-medium text-white/60">Status</span>
                  <Badge
                    variant={isActive ? 'default' : 'destructive'}
                    className={
                      isActive
                        ? 'bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30'
                        : 'bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30'
                    }
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                  <span className="text-sm font-medium text-white/60">Account ID</span>
                  <span className="break-all font-mono text-xs text-white sm:text-sm">
                    {userProfile.accountId}
                  </span>
                </div>

                <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                  <span className="text-sm font-medium text-white/60">Created</span>
                  <span className="text-xs text-white sm:text-sm">
                    {formatTimestamp(license.createdAt)}
                  </span>
                </div>

                {license.updatedAt && (
                  <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                    <span className="text-sm font-medium text-white/60">Last Updated</span>
                    <span className="text-xs text-white sm:text-sm">
                      {formatTimestamp(license.updatedAt)}
                    </span>
                  </div>
                )}

                {license.revokedAt && (
                  <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                    <span className="text-sm font-medium text-white/60">Revoked</span>
                    <span className="text-xs text-[#ef4444] sm:text-sm">
                      {formatTimestamp(license.revokedAt)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
