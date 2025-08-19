import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import UploadSection from "@/components/UploadSection";
import PhoneMockup from "@/components/PhoneMockup";
import CustomizationPanel from "@/components/CustomizationPanel";
import PublishButton from "@/components/PublishButton";
import { useAppBuilder } from "@/hooks/useAppBuilder";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const appBuilder = useAppBuilder();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <Header onResetApp={appBuilder.resetApp} />
      
      {/* Progress Bar */}
      <div className="pt-16">
        <ProgressBar appBuilder={appBuilder} />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            <UploadSection appBuilder={appBuilder} />
          </div>

          {/* Right Column - Preview & Customization */}
          <div className="space-y-6">
            {/* Phone Preview */}
            <div className="bg-app-surface border border-app-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
                {t("preview.title")}
              </h2>
              <PhoneMockup
                appName={appBuilder.appData.appName}
                appDescription={appBuilder.appData.appDescription}
                appColor={appBuilder.appData.appColor}
                appIcon={appBuilder.appData.appIcon?.url}
                appCover={appBuilder.appData.appCover?.url}
                mainProductLabel={appBuilder.appData.mainProductLabel}
                mainProductDescription={appBuilder.appData.mainProductDescription}
                mainProductThumbnail={appBuilder.appData.mainProductThumbnail?.url}
                bonusesLabel={appBuilder.appData.bonusesLabel}
                bonus1Label={appBuilder.appData.bonus1Label}
                bonus1Thumbnail={appBuilder.appData.bonus1Thumbnail?.url}
                bonus2Label={appBuilder.appData.bonus2Label}
                bonus2Thumbnail={appBuilder.appData.bonus2Thumbnail?.url}
                bonus3Label={appBuilder.appData.bonus3Label}
                bonus3Thumbnail={appBuilder.appData.bonus3Thumbnail?.url}
                bonus4Label={appBuilder.appData.bonus4Label}
                bonus4Thumbnail={appBuilder.appData.bonus4Thumbnail?.url}
                template={appBuilder.appData.template}
                onTemplateChange={(template) => appBuilder.updateAppData('template', template)}
              />
            </div>

            {/* Customization Panel */}
            <CustomizationPanel appBuilder={appBuilder} />
            
            {/* Publish Button */}
            <PublishButton appBuilder={appBuilder} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;