import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsCallerAdmin } from '../hooks/useAdmin';
import ConnectBotPanel from '../components/settings/ConnectBotPanel';
import SubscriptionPanel from '../components/settings/SubscriptionPanel';
import ProfileSettingsForm from '../components/settings/ProfileSettingsForm';
import AdminTierManagementPanel from '../components/settings/AdminTierManagementPanel';

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('profile');
  const { data: isAdmin } = useIsCallerAdmin();

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-medium tracking-tight text-white">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-[#121212] border border-white/5">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/10">
              Profile
            </TabsTrigger>
            <TabsTrigger value="connect" className="data-[state=active]:bg-white/10">
              Connect Bot
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-white/10">
              Subscription
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin-tiers" className="data-[state=active]:bg-white/10">
                Admin Tiers
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettingsForm />
          </TabsContent>

          <TabsContent value="connect">
            <ConnectBotPanel />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionPanel />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin-tiers">
              <AdminTierManagementPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
