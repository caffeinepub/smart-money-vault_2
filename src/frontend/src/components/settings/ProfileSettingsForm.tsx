import { useState } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { FormSkeleton } from '../common/LoadingSkeletons';

export default function ProfileSettingsForm() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState(userProfile?.name || '');
  const [accountId, setAccountId] = useState(userProfile?.accountId || '');
  const [timezone, setTimezone] = useState(userProfile?.timezone || 'UTC');
  const [notificationsEnabled, setNotificationsEnabled] = useState(userProfile?.notificationsEnabled ?? true);

  const handleSave = async () => {
    if (!userProfile) return;
    await saveProfile.mutateAsync({
      ...userProfile,
      name,
      accountId: accountId || undefined,
      timezone: timezone || undefined,
      notificationsEnabled,
    });
  };

  if (isLoading) {
    return <FormSkeleton />;
  }

  const principalId = identity?.getPrincipal().toString() || 'Not logged in';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="principal" className="text-sm font-medium text-white/80">
          Principal ID
        </Label>
        <Input
          id="principal"
          value={principalId}
          readOnly
          className="border-white/10 bg-white/5 font-mono text-sm text-white/60"
        />
        <p className="text-xs text-white/40">Your unique Internet Identity principal</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-white/80">
          Display Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          className="border-white/10 bg-white/5 text-sm text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountId" className="text-sm font-medium text-white/80">
          Account Identifier
        </Label>
        <Input
          id="accountId"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="Optional account ID..."
          className="border-white/10 bg-white/5 text-sm text-white"
        />
        <p className="text-xs text-white/40">Used for license verification</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone" className="text-sm font-medium text-white/80">
          Timezone
        </Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="border-white/10 bg-white/5 text-sm text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#121212]">
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="America/New_York">Eastern Time</SelectItem>
            <SelectItem value="America/Chicago">Central Time</SelectItem>
            <SelectItem value="America/Denver">Mountain Time</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
            <SelectItem value="Europe/London">London</SelectItem>
            <SelectItem value="Europe/Paris">Paris</SelectItem>
            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
            <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4">
        <div>
          <Label htmlFor="notifications" className="text-sm font-medium text-white">
            Enable Notifications
          </Label>
          <p className="text-xs text-white/50">Receive alerts for important events</p>
        </div>
        <Switch
          id="notifications"
          checked={notificationsEnabled}
          onCheckedChange={setNotificationsEnabled}
          className="data-[state=checked]:bg-profit"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={!name.trim() || saveProfile.isPending}
        className="w-full bg-profit text-black hover:bg-profit/90 sm:w-auto"
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
    </div>
  );
}
