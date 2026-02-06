import { useGetMyLicenseStatus } from '../hooks/useLicense';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatTimestamp } from '../utils/format';

export default function OverviewScreen() {
  const { data: license, isLoading } = useGetMyLicenseStatus();
  const { data: userProfile } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  const hasAccountId = !!userProfile?.accountId;
  const isActive = license?.active ?? false;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Overview</h2>
          <p className="text-sm text-white/60">Your license status and account information</p>
        </div>

        <Card className="border-white/5 bg-[#000000]">
          <CardHeader>
            <CardTitle className="text-white">License Status</CardTitle>
            <CardDescription className="text-white/60">
              Current status of your trading license
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasAccountId ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="mt-0.5 h-5 w-5 text-white/60" />
                  <div>
                    <p className="font-medium text-white">No Account Identifier</p>
                    <p className="mt-1 text-sm text-white/60">
                      You haven't set an account identifier yet. Please contact an administrator to
                      link your account to a license.
                    </p>
                  </div>
                </div>
              </div>
            ) : !license ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-start space-x-3">
                  <XCircle className="mt-0.5 h-5 w-5 text-[#ef4444]" />
                  <div>
                    <p className="font-medium text-white">No License Found</p>
                    <p className="mt-1 text-sm text-white/60">
                      No license is associated with your account identifier:{' '}
                      <span className="font-mono text-white/80">{userProfile.accountId}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Status</span>
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

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Account ID</span>
                  <span className="font-mono text-sm text-white">
                    {userProfile.accountId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Created</span>
                  <span className="text-sm text-white">
                    {formatTimestamp(license.createdAt)}
                  </span>
                </div>

                {license.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Last Updated</span>
                    <span className="text-sm text-white">
                      {formatTimestamp(license.updatedAt)}
                    </span>
                  </div>
                )}

                {license.revokedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Revoked</span>
                    <span className="text-sm text-[#ef4444]">
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
