import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useUpdateProfile } from '../../hooks/useProfileSettings';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Loader2 } from 'lucide-react';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
];

export default function ProfileSettingsForm() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [tradeAlerts, setTradeAlerts] = useState(true);

  // Initialize form state from loaded profile
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.name || '');
      setTimezone(userProfile.timezone || 'UTC');
      setEmailNotifications(userProfile.notificationsEnabled);
      // Trade alerts can be derived from notificationsEnabled or stored separately
      setTradeAlerts(userProfile.notificationsEnabled);
    }
  }, [userProfile]);

  const handleSave = () => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      name: displayName,
      timezone: timezone,
      notificationsEnabled: emailNotifications,
    };

    updateProfileMutation.mutate(updatedProfile);
  };

  const principalId = identity?.getPrincipal().toString() || '';
  const isSaving = updateProfileMutation.isPending;

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Principal ID - Read Only */}
      <div className="space-y-2">
        <Label htmlFor="principal" className="text-sm font-medium text-white">
          Principal ID
        </Label>
        <Input
          id="principal"
          value={principalId}
          readOnly
          className="cursor-not-allowed bg-white/5 font-mono text-xs text-white/70"
        />
        <p className="text-xs text-white/40">Your unique Internet Identity principal (read-only)</p>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-sm font-medium text-white">
          Display Name
        </Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          className="bg-white/5 text-white placeholder:text-white/30"
        />
        <p className="text-xs text-white/40">This name will be displayed throughout the application</p>
      </div>

      {/* Timezone Selector */}
      <div className="space-y-2">
        <Label htmlFor="timezone" className="text-sm font-medium text-white">
          Timezone
        </Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger id="timezone" className="bg-white/5 text-white">
            <SelectValue placeholder="Select your timezone" />
          </SelectTrigger>
          <SelectContent className="bg-[#0A0A0A] border-white/10">
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value} className="text-white hover:bg-white/10">
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-white/40">Used for displaying timestamps in your local time</p>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-medium text-white">Notification Preferences</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailNotifications" className="text-sm font-medium text-white">
              Email Notifications
            </Label>
            <p className="text-xs text-white/40">Receive email updates about your account</p>
          </div>
          <Switch
            id="emailNotifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="tradeAlerts" className="text-sm font-medium text-white">
              Trade Alerts
            </Label>
            <p className="text-xs text-white/40">Get notified when trades are executed</p>
          </div>
          <Switch id="tradeAlerts" checked={tradeAlerts} onCheckedChange={setTradeAlerts} />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving || !displayName.trim()}
          className="bg-profit hover:bg-profit/90 text-white disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
