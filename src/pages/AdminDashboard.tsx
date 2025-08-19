import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';
import { Users, Settings, Plug, Smartphone } from 'lucide-react';
import StudentsPanel from '@/components/admin/StudentsPanel';
import SettingsPanel from '@/components/admin/SettingsPanel';
import IntegrationsPanel from '@/components/admin/IntegrationsPanel';
import AppsManagementPanel from '@/components/admin/AppsManagementPanel';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <div className="bg-app-surface border-b border-app-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('admin.title')}</h1>
              <p className="text-sm text-app-muted">{t('admin.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-app-surface border border-app-border">
            <TabsTrigger value="students" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              {t('admin.students')}
            </TabsTrigger>
            <TabsTrigger value="apps" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Smartphone className="w-4 h-4 mr-2" />
              {t('admin.apps')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              {t('admin.settings')}
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Plug className="w-4 h-4 mr-2" />
              {t('admin.integrations')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentsPanel />
          </TabsContent>

          <TabsContent value="apps">
            <AppsManagementPanel />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;