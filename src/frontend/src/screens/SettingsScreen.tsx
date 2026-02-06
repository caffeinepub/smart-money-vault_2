import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConnectBotPanel from '../components/settings/ConnectBotPanel';
import SubscriptionPanel from '../components/settings/SubscriptionPanel';

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('connect');

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-medium tracking-tight text-white">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-[#121212] border border-white/5">
            <TabsTrigger value="connect" className="data-[state=active]:bg-white/10">
              Connect Bot
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-white/10">
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect">
            <ConnectBotPanel />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
