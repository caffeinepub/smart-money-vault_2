import { useState, useEffect } from 'react';
import { useIsCallerAdmin, useGetAllLicenses, useCreateOrUpdateLicense, useRevokeLicense } from '../hooks/useAdmin';
import AccessDeniedScreen from '../components/common/AccessDeniedScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, ToggleLeft, ToggleRight, XCircle, AlertCircle } from 'lucide-react';
import { formatTimestamp } from '../utils/format';
import { useOnboardingTour } from '../components/tour/OnboardingTourProvider';
import { PageSkeleton, TableSkeleton } from '../components/common/LoadingSkeletons';
import { StateMessage } from '../components/common/StateMessage';
import type { TourStep } from '../components/tour/types';

const TOUR_STEPS: TourStep[] = [
  {
    id: 'admin-create-license',
    screen: 'admin',
    targetId: 'admin-create-license-card',
    title: 'Create License',
    description: 'Create or update licenses for user accounts. Enter an account ID and set the active status.',
    placement: 'bottom',
    adminOnly: true,
  },
  {
    id: 'admin-licenses-table',
    screen: 'admin',
    targetId: 'admin-licenses-table-card',
    title: 'License Management',
    description: 'View all licenses, toggle their status, or revoke them entirely.',
    placement: 'top',
    adminOnly: true,
  },
];

export default function AdminScreen() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: licenses, isLoading: licensesLoading, isError, refetch } = useGetAllLicenses();
  const createOrUpdate = useCreateOrUpdateLicense();
  const revoke = useRevokeLicense();
  const [accountId, setAccountId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const { registerSteps } = useOnboardingTour();

  useEffect(() => {
    registerSteps(TOUR_STEPS);
  }, [registerSteps]);

  const handleCreateOrUpdate = async () => {
    if (!accountId.trim()) return;
    await createOrUpdate.mutateAsync({ accountId, active: isActive });
    setAccountId('');
    setIsActive(true);
  };

  const handleToggle = async (accountId: string, currentStatus: boolean) => {
    await createOrUpdate.mutateAsync({ accountId, active: !currentStatus });
  };

  const handleRevoke = async (accountId: string) => {
    if (confirm(`Are you sure you want to revoke the license for ${accountId}?`)) {
      await revoke.mutateAsync(accountId);
    }
  };

  if (adminCheckLoading) {
    return <PageSkeleton />;
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Admin Panel</h2>
          <p className="mt-1 text-sm text-white/60">Manage user licenses and system configuration</p>
        </div>

        <div className="rounded-lg border border-profit/20 bg-profit/5 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-profit" />
            <div>
              <p className="text-sm font-medium text-white">Administrator Access</p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                You have full administrative privileges. Use these tools carefully.
              </p>
            </div>
          </div>
        </div>

        <Card id="admin-create-license-card" className="border-white/5 bg-[#000000]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white sm:text-lg">Create or Update License</CardTitle>
            <CardDescription className="text-xs text-white/60 sm:text-sm">
              Manage user access by creating or updating licenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountId" className="text-xs font-medium text-white/80 sm:text-sm">
                  Account ID
                </Label>
                <Input
                  id="accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter account ID..."
                  className="border-white/10 bg-white/5 text-sm text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive" className="text-xs font-medium text-white/80 sm:text-sm">
                  Status
                </Label>
                <div className="flex h-10 items-center space-x-3 rounded-lg border border-white/10 bg-white/5 px-3">
                  <button
                    onClick={() => setIsActive(true)}
                    className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-profit' : 'text-white/40'
                    }`}
                  >
                    Active
                  </button>
                  <span className="text-white/20">|</span>
                  <button
                    onClick={() => setIsActive(false)}
                    className={`text-sm font-medium transition-colors ${
                      !isActive ? 'text-loss' : 'text-white/40'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                onClick={handleCreateOrUpdate}
                disabled={!accountId.trim() || createOrUpdate.isPending}
                className="bg-profit text-black hover:bg-profit/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                {createOrUpdate.isPending ? 'Processing...' : 'Create/Update License'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card id="admin-licenses-table-card" className="border-white/5 bg-[#000000]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white sm:text-lg">All Licenses</CardTitle>
            <CardDescription className="text-xs text-white/60 sm:text-sm">
              {licenses && licenses.length > 0
                ? `Managing ${licenses.length} license${licenses.length === 1 ? '' : 's'}`
                : 'No licenses found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {licensesLoading ? (
              <TableSkeleton rows={5} />
            ) : isError ? (
              <StateMessage
                variant="error"
                title="Failed to Load Licenses"
                description="Unable to fetch license data. Please try again."
                action={{ label: 'Retry', onClick: () => refetch() }}
              />
            ) : !licenses || licenses.length === 0 ? (
              <StateMessage
                variant="empty"
                title="No Licenses"
                description="No licenses have been created yet. Use the form above to create your first license."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-white/70 sm:text-sm">Account ID</TableHead>
                      <TableHead className="text-xs font-semibold text-white/70 sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-white/70 sm:text-sm">Created</TableHead>
                      <TableHead className="text-xs font-semibold text-white/70 sm:text-sm">Updated</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-white/70 sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map(([accountId, license]) => (
                      <TableRow key={accountId} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-mono text-xs text-white sm:text-sm">
                          {accountId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={license.active ? 'default' : 'destructive'}
                            className={
                              license.active
                                ? 'bg-profit/20 text-profit'
                                : 'bg-loss/20 text-loss'
                            }
                          >
                            {license.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-white/70 sm:text-sm">
                          {formatTimestamp(license.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs text-white/70 sm:text-sm">
                          {license.updatedAt ? formatTimestamp(license.updatedAt) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleToggle(accountId, license.active)}
                              variant="ghost"
                              size="sm"
                              className="text-white/60 hover:bg-white/10 hover:text-white"
                            >
                              {license.active ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => handleRevoke(accountId)}
                              variant="ghost"
                              size="sm"
                              className="text-loss hover:bg-loss/10 hover:text-loss"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
