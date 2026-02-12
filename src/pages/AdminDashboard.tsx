import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';
import { Users, Settings, Plug, Smartphone, LogOut, MessageCircle, Video, Sparkles, Download, XCircle, Bell, Code, Megaphone, FlaskConical } from 'lucide-react';
import StudentsPanel from '@/components/admin/StudentsPanel';
import SettingsPanel from '@/components/admin/SettingsPanel';
import IntegrationsPanel from '@/components/admin/IntegrationsPanel';
import AppsManagementPanel from '@/components/admin/AppsManagementPanel';
import WhatsAppSettingsPanel from '@/components/admin/WhatsAppSettingsPanel';
import TutorialVideosPanel from '@/components/admin/TutorialVideosPanel';
import SplashScreenPreview from '@/components/admin/SplashScreenPreview';
import PWASettingsPanel from '@/components/admin/PWASettingsPanel';
import CancellationFeedbackPanel from '@/components/admin/CancellationFeedbackPanel';
import NotificationsPanel from '@/components/admin/NotificationsPanel';
import CustomScriptsPanel from '@/components/admin/CustomScriptsPanel';
import SocialProofPanel from '@/components/admin/SocialProofPanel';
import FeatureFlagsPanel from '@/components/admin/FeatureFlagsPanel';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('students');
  const { signOut } = useAuthContext();
  const navigate = useNavigate();
    
    const handleLogout = async () => {
      const { error } = await signOut();
      if (error) {
        toast.error(t('admin.logout.error'));
      } else {
        toast.success(t('admin.logout.success'));
        navigate('/admin/login');
      }
    };


  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <div className="bg-app-surface border-b border-app-border p-3 sm:p-4">
        <div className="container mx-auto">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{t('admin.title')}</h1>
              <p className="text-xs sm:text-sm text-app-muted truncate">{t('admin.subtitle')}</p>
            </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t("admin.exit")}</span>
              </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-7 sm:grid-cols-13 bg-app-surface border border-app-border h-auto">
            <TabsTrigger
              value="students" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.students')}</span>
              <span className="sm:hidden ml-1">{t("admin.students.mobile")}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="apps" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.apps')}</span>
              <span className="sm:hidden ml-1">{t("admin.apps.mobile")}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.settings')}</span>
              <span className="sm:hidden ml-1">{t("admin.settings.mobile")}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="integrations" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Plug className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.integrations')}</span>
              <span className="sm:hidden ml-1">{t("admin.integrations.mobile")}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="whatsapp" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.whatsapp.full")}</span>
              <span className="sm:hidden ml-1">{t("admin.whatsapp.mobile")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="videos" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Video className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.videos.full")}</span>
              <span className="sm:hidden ml-1">{t("admin.videos.mobile")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="splash"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.splash.full")}</span>
              <span className="sm:hidden ml-1">{t("admin.splash.mobile")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="pwa"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("admin.pwa.full")}</span>
              <span className="sm:hidden ml-1">{t("admin.pwa.mobile")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="cancellations"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Cancelamentos</span>
              <span className="sm:hidden ml-1">Cancel.</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.notifications.tab')}</span>
              <span className="sm:hidden ml-1">Notif.</span>
            </TabsTrigger>
            <TabsTrigger
              value="scripts"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Code className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Scripts</span>
              <span className="sm:hidden ml-1">Scripts</span>
            </TabsTrigger>
            <TabsTrigger
              value="socialproof"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Megaphone className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Prova Social</span>
              <span className="sm:hidden ml-1">Prova</span>
            </TabsTrigger>
            <TabsTrigger
              value="featureflags"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Funcionalidades</span>
              <span className="sm:hidden ml-1">Funcs.</span>
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

          <TabsContent value="whatsapp">
            <WhatsAppSettingsPanel />
          </TabsContent>

          <TabsContent value="videos">
            <TutorialVideosPanel />
          </TabsContent>

          <TabsContent value="splash">
            <SplashScreenPreview />
          </TabsContent>

          <TabsContent value="pwa">
            <PWASettingsPanel />
          </TabsContent>

          <TabsContent value="cancellations">
            <CancellationFeedbackPanel />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsPanel />
          </TabsContent>

          <TabsContent value="scripts">
            <CustomScriptsPanel />
          </TabsContent>

          <TabsContent value="socialproof">
            <SocialProofPanel />
          </TabsContent>

          <TabsContent value="featureflags">
            <FeatureFlagsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
