import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsCallerAdmin } from '../hooks/useAdmin';
import ProfileSettingsForm from '../components/settings/ProfileSettingsForm';

export default function SettingsRouteScreen() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const [activeTab, setActiveTab] = useState('profile');

  // Auto-correct tab if user is not admin and tries to access Subscription
  useEffect(() => {
    if (!adminLoading && !isAdmin && activeTab === 'subscription') {
      setActiveTab('profile');
    }
  }, [isAdmin, adminLoading, activeTab]);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="mt-2 text-sm text-white/50">Manage your account preferences and configuration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 bg-white/5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          {!adminLoading && isAdmin && (
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-medium text-white">Profile Settings</h2>
            <ProfileSettingsForm />
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-xl font-medium text-white">Connections</h2>
            <p className="text-sm text-white/50">
              Connection management features will be implemented here. This section will allow you to manage
              integrations, API keys, and external service connections.
            </p>
          </div>
        </TabsContent>

        {!adminLoading && isAdmin && (
          <TabsContent value="subscription" className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="mb-4 text-xl font-medium text-white">Subscription Management</h2>
              <p className="text-sm text-white/50">
                Subscription tier management features will be implemented here. This admin-only section will
                allow you to manage subscription plans, billing, and user tier assignments.
              </p>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
