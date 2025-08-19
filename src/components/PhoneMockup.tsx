import { Smartphone, Eye, ChevronLeft, ChevronRight, Lock, Crown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";
import { usePremiumTemplates } from "@/hooks/usePremiumTemplates";
import { Button } from "@/components/ui/button";
import PremiumOverlay from "@/components/ui/premium-overlay";

interface PhoneMockupProps {
  appName?: string;
  appDescription?: string;
  appColor?: string;
  appIcon?: string;
  appCover?: string;
  mainProductLabel?: string;
  mainProductDescription?: string;
  mainProductThumbnail?: string;
  bonusesLabel?: string;
  bonus1Label?: string;
  bonus1Thumbnail?: string;
  bonus2Label?: string;
  bonus2Thumbnail?: string;
  bonus3Label?: string;
  bonus3Thumbnail?: string;
  bonus4Label?: string;
  bonus4Thumbnail?: string;
  template?: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal';
  onTemplateChange?: (template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal') => void;
}

const PhoneMockup = ({ 
  appName = "",
  appDescription = "",
  appColor = "#4783F6",
  appIcon,
  appCover,
  mainProductLabel = "PRODUTO PRINCIPAL",
  mainProductDescription = "Disponível para download",
  mainProductThumbnail,
  bonusesLabel = "BÔNUS EXCLUSIVOS",
  bonus1Label = "Bônus 1",
  bonus1Thumbnail,
  bonus2Label = "Bônus 2",
  bonus2Thumbnail,
  bonus3Label = "Bônus 3",
  bonus3Thumbnail,
  bonus4Label = "Bônus 4",
  bonus4Thumbnail,
  template = "classic",
  onTemplateChange
}: PhoneMockupProps) => {
  const { t } = useLanguage();
  const { hasPremiumAccess } = usePremiumTemplates();
  const [currentTime, setCurrentTime] = useState("");
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

  const templates = [
    { id: 'classic', name: 'Classic', description: 'Layout padrão limpo e elegante', isPremium: false },
    { id: 'corporate', name: 'Corporate', description: 'Layout profissional para empresas', isPremium: true },
    { id: 'showcase', name: 'Showcase', description: 'Layout moderno para destaque visual', isPremium: true },
    { id: 'modern', name: 'Modern', description: 'Design contemporâneo e minimalista', isPremium: true },
    { id: 'minimal', name: 'Minimal', description: 'Interface limpa e focada no conteúdo', isPremium: true }
  ] as const;

  // Encontrar o índice do template atual
  useEffect(() => {
    const index = templates.findIndex(t => t.id === template);
    if (index !== -1) {
      setCurrentTemplateIndex(index);
    }
  }, [template]);

  const handlePrevTemplate = () => {
    const newIndex = currentTemplateIndex > 0 ? currentTemplateIndex - 1 : templates.length - 1;
    setCurrentTemplateIndex(newIndex);
    const newTemplate = templates[newIndex];
    
    // Se é premium e o usuário não tem acesso, não aplicar
    if (newTemplate.isPremium && !hasPremiumAccess) {
      return; // Apenas navega visualmente mas não aplica
    }
    
    if (onTemplateChange) {
      onTemplateChange(newTemplate.id);
    }
  };

  const handleNextTemplate = () => {
    const newIndex = currentTemplateIndex < templates.length - 1 ? currentTemplateIndex + 1 : 0;
    setCurrentTemplateIndex(newIndex);
    const newTemplate = templates[newIndex];
    
    // Se é premium e o usuário não tem acesso, não aplicar
    if (newTemplate.isPremium && !hasPremiumAccess) {
      return; // Apenas navega visualmente mas não aplica
    }
    
    if (onTemplateChange) {
      onTemplateChange(newTemplate.id);
    }
  };

  const currentTemplate = templates[currentTemplateIndex];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // GMT-3
      const hours = brasiliaTime.getUTCHours().toString().padStart(2, '0');
      const minutes = brasiliaTime.getUTCMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);
  const renderClassicTemplate = () => (
    <>
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 text-xs text-white">
        <span>{currentTime}</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
        <span>100%</span>
      </div>

      {/* App Cover/Header */}
      <div 
        className="h-32 relative"
        style={{
          background: appCover 
            ? `url(${appCover}) center/cover` 
            : `linear-gradient(135deg, ${appColor}, ${appColor}88)`
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-4 left-4 flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-black"
            style={{ backgroundColor: appColor }}
          >
            {appIcon ? (
              <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
            ) : (
              <Smartphone className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{appName}</h3>
            <p className="text-white/80 text-sm">{appDescription}</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 space-y-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: appColor }}>
              {mainProductThumbnail ? (
                <img src={mainProductThumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">PDF</span>
              )}
            </div>
            <div>
            <h4 className="text-white font-medium text-sm">{mainProductLabel}</h4>
            <p className="text-gray-400 text-xs">{mainProductDescription}</p>
            </div>
          </div>
          <button 
            className="w-full py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: appColor }}
          >
            {t("phone.view")}
          </button>
        </div>

        <div className="space-y-2">
          <h5 className="text-white font-medium text-sm">{bonusesLabel}</h5>
          {[
            { id: 1, label: bonus1Label, thumbnail: bonus1Thumbnail },
            { id: 2, label: bonus2Label, thumbnail: bonus2Thumbnail },
            { id: 3, label: bonus3Label, thumbnail: bonus3Thumbnail },
            { id: 4, label: bonus4Label, thumbnail: bonus4Thumbnail }
          ].map((bonus) => (
            <div key={bonus.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${appColor}20` }}>
                  {bonus.thumbnail ? (
                    <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-accent text-xs">🎁</span>
                  )}
                </div>
                <span className="text-gray-300 text-xs">{bonus.label}</span>
              </div>
              <button className="text-primary text-xs flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{t("phone.view")}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderCorporateTemplate = () => (
    <>
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 text-xs text-white bg-gray-900">
        <span>{currentTime}</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
        <span>100%</span>
      </div>

      {/* Top Navigation Bar */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: appColor }}
          >
            {appIcon ? (
              <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
            ) : (
              <Smartphone className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{appName}</h3>
            <p className="text-gray-400 text-xs">{appDescription}</p>
          </div>
        </div>
      </div>

      {/* Sidebar Layout */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-20 bg-gray-900 border-r border-gray-700 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">📁</span>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">🎁</span>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">⚙️</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 bg-gray-800">
          {/* Main Product Card - Large */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: appColor }}>
                {mainProductThumbnail ? (
                  <img src={mainProductThumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-bold">PDF</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm mb-1">{mainProductLabel}</h4>
                <p className="text-gray-400 text-xs mb-2">{mainProductDescription}</p>
                <button 
                  className="px-3 py-1 rounded text-white text-xs font-medium"
                  style={{ backgroundColor: appColor }}
                >
                  Acessar
                </button>
              </div>
            </div>
          </div>

          {/* Bonus Grid */}
          <div className="space-y-2">
            <h5 className="text-gray-200 font-medium text-xs mb-2">{bonusesLabel}</h5>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 1, label: bonus1Label, thumbnail: bonus1Thumbnail },
                { id: 2, label: bonus2Label, thumbnail: bonus2Thumbnail },
                { id: 3, label: bonus3Label, thumbnail: bonus3Thumbnail },
                { id: 4, label: bonus4Label, thumbnail: bonus4Thumbnail }
              ].map((bonus) => (
                <div key={bonus.id} className="bg-gray-900/70 border border-gray-600/50 rounded-lg p-2">
                  <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden mb-2" style={{ backgroundColor: `${appColor}20` }}>
                    {bonus.thumbnail ? (
                      <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-accent text-xs">🎁</span>
                    )}
                  </div>
                  <span className="text-gray-300 text-xs block mb-1">{bonus.label}</span>
                  <button className="text-primary text-xs">Ver</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderShowcaseTemplate = () => (
    <>
      {/* Full Cover Header */}
      <div 
        className="h-40 relative"
        style={{
          background: appCover 
            ? `url(${appCover}) center/cover` 
            : `linear-gradient(135deg, ${appColor}, ${appColor}88)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
        
        {/* Status Bar Overlay */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 text-xs text-white/90">
          <span>{currentTime}</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white/90 rounded-full"></div>
            <div className="w-1 h-1 bg-white/90 rounded-full"></div>
            <div className="w-1 h-1 bg-white/90 rounded-full"></div>
          </div>
          <span>100%</span>
        </div>

        {/* Centered App Info */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl overflow-hidden border-3 border-white/20 mx-auto mb-2"
            style={{ backgroundColor: appColor }}
          >
            {appIcon ? (
              <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
            ) : (
              <Smartphone className="w-8 h-8 text-white" />
            )}
          </div>
          <h3 className="text-white font-bold text-lg">{appName}</h3>
          <p className="text-white/80 text-sm">{appDescription}</p>
        </div>
      </div>

      {/* Content Cards */}
      <div className="flex-1 p-4 space-y-4 bg-gradient-to-b from-purple-900/20 to-black">
        {/* Featured Product - Large Visual Card */}
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-6 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-3" style={{ backgroundColor: appColor }}>
            {mainProductThumbnail ? (
              <img src={mainProductThumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-lg font-bold">📄</span>
            )}
          </div>
          <h4 className="text-white font-bold text-sm mb-2">{mainProductLabel}</h4>
          <p className="text-purple-200 text-xs mb-4">{mainProductDescription}</p>
          <button 
            className="w-full py-2 rounded-xl text-white text-sm font-bold shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${appColor}, ${appColor}dd)`,
              boxShadow: `0 4px 15px ${appColor}30`
            }}
          >
            ✨ {t("phone.view")}
          </button>
        </div>

        {/* Bonus Showcase */}
        <div className="space-y-3">
          <h5 className="text-white font-bold text-sm text-center">{bonusesLabel}</h5>
          {[
            { id: 1, label: bonus1Label, thumbnail: bonus1Thumbnail },
            { id: 2, label: bonus2Label, thumbnail: bonus2Thumbnail },
            { id: 3, label: bonus3Label, thumbnail: bonus3Thumbnail },
            { id: 4, label: bonus4Label, thumbnail: bonus4Thumbnail }
          ].map((bonus, index) => (
            <div key={bonus.id} className={`bg-gradient-to-r from-purple-800/30 to-pink-800/30 border border-purple-400/20 rounded-xl p-3 ${index % 2 === 0 ? 'mr-4' : 'ml-4'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${appColor}40` }}>
                  {bonus.thumbnail ? (
                    <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm">🎁</span>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-white font-medium text-xs block">{bonus.label}</span>
                  <p className="text-purple-200/80 text-xs">Bônus exclusivo</p>
                </div>
                <button className="text-purple-300 hover:text-purple-200 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-black/40 backdrop-blur-sm border-t border-purple-500/20 px-4 py-3">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="w-6 h-6 mx-auto mb-1 text-purple-300">🏠</div>
            <span className="text-purple-300 text-xs">Home</span>
          </div>
          <div className="text-center">
            <div className="w-6 h-6 mx-auto mb-1 text-purple-300">📋</div>
            <span className="text-purple-300 text-xs">Produtos</span>
          </div>
          <div className="text-center">
            <div className="w-6 h-6 mx-auto mb-1 text-purple-300">⭐</div>
            <span className="text-purple-300 text-xs">Favoritos</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderModernTemplate = () => (
    <>
      {/* Minimal Status Bar */}
      <div className="flex justify-between items-center px-4 py-3 text-xs text-white bg-slate-900">
        <span className="font-medium">{currentTime}</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
        <span className="font-medium">100%</span>
      </div>

      {/* Clean Header */}
      <div className="bg-slate-900 px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg"
              style={{ backgroundColor: appColor }}
            >
              {appIcon ? (
                <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
              ) : (
                <Smartphone className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-base">{appName}</h3>
              <p className="text-slate-400 text-xs">{appDescription}</p>
            </div>
          </div>
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">⚙️</span>
          </div>
        </div>
      </div>

      {/* Modern Card Layout */}
      <div className="flex-1 p-4 bg-slate-800 space-y-6">
        {/* Hero Product Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: appColor }}>
              {mainProductThumbnail ? (
                <img src={mainProductThumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-lg font-bold">📄</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-base mb-1">{mainProductLabel}</h4>
              <p className="text-slate-300 text-sm">{mainProductDescription}</p>
            </div>
          </div>
          <button 
            className="w-full py-3 rounded-2xl text-white font-semibold text-sm shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: appColor }}
          >
            Acessar Agora
          </button>
        </div>

        {/* Bonus Section */}
        <div>
          <h5 className="text-slate-200 font-semibold text-sm mb-4">{bonusesLabel}</h5>
          <div className="space-y-3">
            {[
              { id: 1, label: bonus1Label, thumbnail: bonus1Thumbnail },
              { id: 2, label: bonus2Label, thumbnail: bonus2Thumbnail },
              { id: 3, label: bonus3Label, thumbnail: bonus3Thumbnail },
              { id: 4, label: bonus4Label, thumbnail: bonus4Thumbnail }
            ].map((bonus) => (
              <div key={bonus.id} className="bg-slate-800/60 border border-slate-500/30 rounded-2xl p-4 hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${appColor}30` }}>
                    {bonus.thumbnail ? (
                      <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm">🎁</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-medium text-sm">{bonus.label}</span>
                    <p className="text-slate-400 text-xs">Conteúdo adicional</p>
                  </div>
                  <button className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-500 transition-colors">
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderMinimalTemplate = () => (
    <>
      {/* Ultra Clean Status */}
      <div className="flex justify-between items-center px-4 py-3 text-xs text-white/70">
        <span>{currentTime}</span>
        <span>100%</span>
      </div>

      {/* Minimal Header */}
      <div className="px-4 py-6 text-center">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden mx-auto mb-3 shadow-lg"
          style={{ backgroundColor: appColor }}
        >
          {appIcon ? (
            <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
          ) : (
            <Smartphone className="w-6 h-6 text-white" />
          )}
        </div>
        <h3 className="text-white font-light text-lg">{appName}</h3>
        <p className="text-white/60 text-sm">{appDescription}</p>
      </div>

      {/* Minimal Content */}
      <div className="flex-1 px-4 space-y-6">
        {/* Main Product - Minimal Card */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-5">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-3" style={{ backgroundColor: `${appColor}40` }}>
              {mainProductThumbnail ? (
                <img src={mainProductThumbnail} alt="Product thumbnail" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xl">📄</span>
              )}
            </div>
            <h4 className="text-white font-light text-base mb-2">{mainProductLabel}</h4>
            <p className="text-white/60 text-sm mb-4">{mainProductDescription}</p>
            <button 
              className="px-6 py-2 rounded-full text-white font-light text-sm border border-white/30 hover:bg-white/10 transition-colors"
              style={{ color: appColor, borderColor: appColor }}
            >
              {t("phone.view")}
            </button>
          </div>
        </div>

        {/* Bonus List - Ultra Clean */}
        <div className="space-y-4">
          <h5 className="text-white/90 font-light text-sm text-center">{bonusesLabel}</h5>
          <div className="space-y-3">
            {[
              { id: 1, label: bonus1Label, thumbnail: bonus1Thumbnail },
              { id: 2, label: bonus2Label, thumbnail: bonus2Thumbnail },
              { id: 3, label: bonus3Label, thumbnail: bonus3Thumbnail },
              { id: 4, label: bonus4Label, thumbnail: bonus4Thumbnail }
            ].map((bonus) => (
              <div key={bonus.id} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${appColor}20` }}>
                    {bonus.thumbnail ? (
                      <img src={bonus.thumbnail} alt={`${bonus.label} thumbnail`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/80 text-xs">🎁</span>
                    )}
                  </div>
                  <span className="text-white/90 font-light text-sm flex-1">{bonus.label}</span>
                  <button className="text-white/50 hover:text-white/80 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="px-4 py-4 text-center">
        <div className="w-8 h-1 bg-white/20 rounded-full mx-auto"></div>
      </div>
    </>
  );

  const renderTemplate = () => {
    switch (currentTemplate.id) {
      case 'corporate':
        return renderCorporateTemplate();
      case 'showcase':
        return renderShowcaseTemplate();
      case 'modern':
        return renderModernTemplate();
      case 'minimal':
        return renderMinimalTemplate();
      default:
        return renderClassicTemplate();
    }
  };

  return (
    <div className="flex justify-center relative">
      {/* Template Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={handlePrevTemplate}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        onClick={handleNextTemplate}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="phone-mockup">

        {/* Phone Screen */}
        <div className="phone-screen relative">
          {renderTemplate()}
          
          {/* Premium Template Overlay - Centralizada e por cima */}
          {currentTemplate.isPremium && !hasPremiumAccess && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-[2.5rem] z-30 flex items-center justify-center">
              <div className="bg-black/80 rounded-xl p-6 mx-6 text-center border border-orange-500/30 max-w-xs">
                <Crown className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">{currentTemplate.name}</h3>
                <p className="text-white/70 text-sm mb-4">{currentTemplate.description}</p>
                <div className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-medium">
                  Plano Empresarial
                </div>
                <p className="text-white/60 text-xs mt-3">
                  Upgrade para acessar templates premium
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;