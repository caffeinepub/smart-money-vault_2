import { useState } from 'react';
import { useIsCallerAdmin, useGetAllLicenses, useCreateOrUpdateLicense, useRevokeLicense } from '../hooks/useAdmin';
import AccessDeniedScreen from '../components/common/AccessDeniedScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, ToggleLeft, ToggleRight, XCircle, AlertCircle } from 'lucide-react';
import { formatTimestamp } from '../utils/format';

export default function AdminScreen() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: licenses, isLoading: licensesLoading } = useGetAllLicenses();
  const createOrUpdate = useCreateOrUpdateLicense();
  const revoke = useRevokeLicense();

  const [newAccountId, setNewAccountId] = useState('');

  const handleCreateLicense = async () => {
    if (!newAccountId.trim()) return;
    await createOrUpdate.mutateAsync({ accountId: newAccountId, active: true });
    setNewAccountId('');
  };

  const handleToggleLicense = async (accountId: string, currentActive: boolean) => {
    await createOrUpdate.mutateAsync({ accountId, active: !currentActive });
  };

  const handleRevokeLicense = async (accountId: string) => {
    await revoke.mutateAsync(accountId);
  };

  if (adminCheckLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Admin Panel</h2>
          <p className="text-xs text-white/60 sm:text-sm">Manage user licenses and permissions</p>
        </div>

        {/* Phase 1 Info Banner */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 backdrop-blur-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-200 sm:text-base">Phase 1: Per-User Bot Keys</p>
              <p className="mt-1 text-xs text-blue-200/80 sm:text-sm">
                Each user generates their own bot keypair via the Connect Bot wizard. The backend stores
                only the public key for signature verification. Licenses control trading access per account.
              </p>
            </div>
          </div>
        </div>

        {/* Create License */}
        <Card className="border-white/5 bg-[#000000]">
          <CardHeader>
            <CardTitle className="text-base text-white sm:text-lg">Create License</CardTitle>
            <CardDescription className="text-xs text-white/60 sm:text-sm">
              Issue a new trading license for an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-end sm:space-x-4 sm:space-y-0">
              <div className="flex-1 space-y-2">
                <Label htmlFor="accountId" className="text-xs text-white/80 sm:text-sm">
                  Account ID
                </Label>
                <Input
                  id="accountId"
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  placeholder="Enter account identifier..."
                  className="border-white/10 bg-white/5 text-sm text-white placeholder:text-white/40"
                />
              </div>
              <Button
                onClick={handleCreateLicense}
                disabled={!newAccountId.trim() || createOrUpdate.isPending}
                className="bg-profit text-black hover:bg-profit/90"
              >
                {createOrUpdate.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create License
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Licenses Table */}
        <Card className="border-white/5 bg-[#000000]">
          <CardHeader>
            <CardTitle className="text-base text-white sm:text-lg">All Licenses</CardTitle>
            <CardDescription className="text-xs text-white/60 sm:text-sm">
              {licenses ? `${licenses.length} license${licenses.length === 1 ? '' : 's'} total` : 'Loading...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {licensesLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
              </div>
            ) : !licenses || licenses.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-white/60">No licenses found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-xs text-white/60 sm:text-sm">Account ID</TableHead>
                      <TableHead className="text-xs text-white/60 sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs text-white/60 sm:text-sm">Created</TableHead>
                      <TableHead className="text-xs text-white/60 sm:text-sm">Updated</TableHead>
                      <TableHead className="text-right text-xs text-white/60 sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map(([accountId, license]) => (
                      <TableRow key={accountId} className="border-white/5 hover:bg-white/5">
                        <TableCell className="break-all font-mono text-xs text-white sm:text-sm">
                          {accountId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={license.active ? 'default' : 'destructive'}
                            className={
                              license.active
                                ? 'bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30'
                                : 'bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30'
                            }
                          >
                            {license.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-white/60 sm:text-sm">
                          {formatTimestamp(license.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs text-white/60 sm:text-sm">
                          {license.updatedAt ? formatTimestamp(license.updatedAt) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleToggleLicense(accountId, license.active)}
                              disabled={createOrUpdate.isPending}
                              variant="outline"
                              size="sm"
                              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                            >
                              {license.active ? (
                                <>
                                  <ToggleRight className="mr-1 h-3 w-3" />
                                  <span className="hidden sm:inline">Disable</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="mr-1 h-3 w-3" />
                                  <span className="hidden sm:inline">Enable</span>
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleRevokeLicense(accountId)}
                              disabled={revoke.isPending}
                              variant="outline"
                              size="sm"
                              className="border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              <span className="hidden sm:inline">Revoke</span>
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
