import { useState } from 'react';
import { useSaveCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '../../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile: UserProfile = {
      name: name.trim(),
      accountId: accountId.trim() || undefined,
      planTier: undefined,
      botPublicKey: undefined,
      bot_id: undefined,
      timezone: undefined,
      notificationsEnabled: true,
    };

    await saveProfile.mutateAsync(profile);
  };

  return (
    <Dialog open={true}>
      <DialogContent className="border-white/5 bg-[#000000] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Welcome to Smart Money Vault</DialogTitle>
          <DialogDescription className="text-white/60">
            Please set up your profile to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">
              Display Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountId" className="text-white/80">
              Account Identifier (Optional)
            </Label>
            <Input
              id="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g., ACCT-001"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full bg-white/10 font-medium text-white hover:bg-white/15"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
