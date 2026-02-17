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
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-medium tracking-tight text-white sm:text-3xl">
          Settings
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6 overflow-x-auto">
            <TabsList className="inline-flex w-full min-w-max bg-[#121212] border border-white/5 sm:w-auto">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-white/10 whitespace-nowrap"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="connect"
                className="data-[state=active]:bg-white/10 whitespace-nowrap"
              >
                Connect Bot
              </TabsTrigger>
              <TabsTrigger
                value="subscription"
                className="data-[state=active]:bg-white/10 whitespace-nowrap"
              >
                Subscription
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger
                  value="admin-tiers"
                  className="data-[state=active]:bg-white/10 whitespace-nowrap"
                >
                  Admin Tiers
                </TabsTrigger>
              )}
            </TabsList>
          </div>

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
