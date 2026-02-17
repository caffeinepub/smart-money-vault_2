import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '../common/ToastProvider';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function ProfileSettingsForm() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.name || '');
      setAccountId(userProfile.accountId || '');
      setTimezone(userProfile.timezone || 'UTC');
      setNotificationsEnabled(userProfile.notificationsEnabled || false);
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        name: displayName,
        accountId: accountId || undefined,
        timezone: timezone || undefined,
        notificationsEnabled,
      });
      showToast('success', 'Profile updated successfully');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  const principalId = identity?.getPrincipal().toString() || 'Not authenticated';

  return (
    <Card className="border-white/5 bg-[#121212]">
      <CardHeader>
        <CardTitle className="text-white">Profile Settings</CardTitle>
        <CardDescription className="text-white/60">
          Manage your account information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Principal ID (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="principal" className="text-white/80">
            Principal ID
          </Label>
          <Input
            id="principal"
            value={principalId}
            readOnly
            className="border-white/10 bg-white/5 text-white/60 font-mono text-sm"
          />
          <p className="text-xs text-white/40">Your unique Internet Identity principal</p>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-white/80">
            Display Name
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
          />
        </div>

        {/* Account ID */}
        <div className="space-y-2">
          <Label htmlFor="accountId" className="text-white/80">
            Account Identifier
          </Label>
          <Input
            id="accountId"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="e.g., ACCT-001"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
          />
          <p className="text-xs text-white/40">Used to link your license and trading activity</p>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-white/80">
            Timezone
          </Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="border-white/10 bg-white/5 text-white">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#121212]">
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz} className="text-white hover:bg-white/10">
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4">
          <div className="space-y-0.5">
            <Label htmlFor="notifications" className="text-white/80">
              Enable Notifications
            </Label>
            <p className="text-xs text-white/40">Receive alerts about trading activity</p>
          </div>
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saveProfile.isPending || !displayName.trim()}
          className="w-full bg-profit text-black hover:bg-profit/90 disabled:opacity-50"
        >
          {saveProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
