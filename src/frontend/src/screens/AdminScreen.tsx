import { useState } from 'react';
import { useIsCallerAdmin, useGetAllLicenses, useCreateOrUpdateLicense, useRevokeLicense } from '../hooks/useAdmin';
import AccessDeniedScreen from '../components/common/AccessDeniedScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle2, XCircle, Shield, Info } from 'lucide-react';
import { formatTimestamp } from '../utils/format';

export default function AdminScreen() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: licenses, isLoading: licensesLoading } = useGetAllLicenses();
  const createOrUpdateLicense = useCreateOrUpdateLicense();
  const revokeLicense = useRevokeLicense();

  const [newAccountId, setNewAccountId] = useState('');

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

  const handleCreateLicense = async () => {
    if (!newAccountId.trim()) return;
    await createOrUpdateLicense.mutateAsync({ accountId: newAccountId.trim(), active: true });
    setNewAccountId('');
  };

  const handleToggleLicense = async (accountId: string, currentActive: boolean) => {
    await createOrUpdateLicense.mutateAsync({ accountId, active: !currentActive });
  };

  const handleRevokeLicense = async (accountId: string) => {
    if (confirm(`Are you sure you want to revoke the license for ${accountId}?`)) {
      await revokeLicense.mutateAsync(accountId);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Admin Panel</h2>
          <p className="text-sm text-white/60">Manage licenses and system configuration</p>
        </div>

        <Tabs defaultValue="licenses" className="space-y-6">
          <TabsList className="border-white/5 bg-[#000000]">
            <TabsTrigger value="licenses" className="data-[state=active]:bg-white/10">
              <Shield className="mr-2 h-4 w-4" />
              Licenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="licenses" className="space-y-6">
            {/* Phase 1 Info Banner */}
            <Card className="border-[#3b82f6]/30 bg-[#3b82f6]/10">
              <CardContent className="flex items-start space-x-3 pt-6">
                <Info className="h-5 w-5 text-[#3b82f6] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-white/90">
                    <strong>Phase 1:</strong> Bot public keys are now managed per-user in their profile settings.
                    Each user can configure their own Ed25519 public key for bot authentication.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Create License */}
            <Card className="border-white/5 bg-[#000000]">
              <CardHeader>
                <CardTitle className="text-white">Create License</CardTitle>
                <CardDescription className="text-white/60">
                  Create a new active license for an account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      value={newAccountId}
                      onChange={(e) => setNewAccountId(e.target.value)}
                      placeholder="Account ID (e.g., ACCT-001)"
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    />
                  </div>
                  <Button
                    onClick={handleCreateLicense}
                    disabled={!newAccountId.trim() || createOrUpdateLicense.isPending}
                    className="bg-white/10 text-white hover:bg-white/15"
                  >
                    {createOrUpdateLicense.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Create'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Licenses List */}
            <Card className="border-white/5 bg-[#000000]">
              <CardHeader>
                <CardTitle className="text-white">All Licenses</CardTitle>
                <CardDescription className="text-white/60">
                  {licenses ? `${licenses.length} total licenses` : 'Loading...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {licensesLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                  </div>
                ) : !licenses || licenses.length === 0 ? (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-white/60">No licenses found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="text-white/60">Account ID</TableHead>
                          <TableHead className="text-white/60">Status</TableHead>
                          <TableHead className="text-white/60">Created</TableHead>
                          <TableHead className="text-white/60">Updated</TableHead>
                          <TableHead className="text-right text-white/60">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {licenses.map(([accountId, license]) => (
                          <TableRow key={accountId} className="border-white/5 hover:bg-white/5">
                            <TableCell className="font-mono text-white">{accountId}</TableCell>
                            <TableCell>
                              <Badge
                                variant={license.active ? 'default' : 'destructive'}
                                className={
                                  license.active
                                    ? 'bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30'
                                    : 'bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30'
                                }
                              >
                                {license.active ? (
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
                            </TableCell>
                            <TableCell className="text-sm text-white/60">
                              {formatTimestamp(license.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm text-white/60">
                              {license.updatedAt ? formatTimestamp(license.updatedAt) : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  onClick={() => handleToggleLicense(accountId, license.active)}
                                  disabled={createOrUpdateLicense.isPending}
                                  variant="outline"
                                  size="sm"
                                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                >
                                  {license.active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  onClick={() => handleRevokeLicense(accountId)}
                                  disabled={revokeLicense.isPending}
                                  variant="outline"
                                  size="sm"
                                  className="border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20"
                                >
                                  Revoke
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
