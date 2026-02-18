import { useState } from "react";
import { Lock, Check, Gift, DollarSign, Star, Sparkles, Zap, Trophy, Crown, Eye, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeRenderer } from "@/components/ThemeRenderer";

// Mapa de ícones
const PREMIUM_ICONS: Record<string, LucideIcon> = {
  gift: Gift, dollar: DollarSign, star: Star, sparkles: Sparkles, zap: Zap, trophy: Trophy, crown: Crown,
};

interface OrderBumpPreviewProps {
  formData: {
    label?: string;
    description?: string;
    nome?: string;
    cor?: string;
    icone_url?: string;
    capa_url?: string;
    premium_card_title?: string;
    premium_card_description?: string;
    premium_image_url?: string;
    bullet1?: string;
    bullet2?: string;
    bullet3?: string;
    unlock_button_color?: string;
    main_product_label?: string;
    main_product_description?: string;
    bonuses_label?: string;
    produto_principal_url?: string;
    main_product_thumbnail?: string;
    bonus1_url?: string;
    bonus1_label?: string;
    bonus1_thumbnail?: string;
    bonus2_url?: string;
    bonus2_label?: string;
    bonus2_thumbnail?: string;
    bonus3_url?: string;
    bonus3_label?: string;
    bonus3_thumbnail?: string;
    bonus4_url?: string;
    bonus4_label?: string;
    bonus4_thumbnail?: string;
    bonus5_url?: string;
    bonus5_label?: string;
    bonus5_thumbnail?: string;
    bonus6_url?: string;
    bonus6_label?: string;
    bonus6_thumbnail?: string;
    bonus7_url?: string;
    bonus7_label?: string;
    bonus7_thumbnail?: string;
    bonus8_url?: string;
    bonus8_label?: string;
    bonus8_thumbnail?: string;
    bonus9_url?: string;
    bonus9_label?: string;
    bonus9_thumbnail?: string;
    view_button_label?: string;
    // Backgrounds
    main_product_background?: string;
    bonus1_background?: string;
    bonus2_background?: string;
    bonus3_background?: string;
    bonus4_background?: string;
    bonus5_background?: string;
    bonus6_background?: string;
    bonus7_background?: string;
    bonus8_background?: string;
    bonus9_background?: string;
    // Template-specific settings
    show_app_icon?: boolean;
    showcase_text_position?: string;
    members_header_size?: string;
    shop_remove_card_border?: boolean;
    members_show_card_border?: boolean;
    flow_show_card_border?: boolean;
    app_name_color?: string;
    app_description?: string;
    app_description_color?: string;
    bonus1_color?: string;
    bonus2_color?: string;
    bonus3_color?: string;
    bonus4_color?: string;
    bonus5_color?: string;
    bonus6_color?: string;
    bonus7_color?: string;
    bonus8_color?: string;
    bonus9_color?: string;
    // Academy carousel covers
    training1_cover?: string;
    training2_cover?: string;
    training3_cover?: string;
    training4_cover?: string;
  };
  appTheme?: 'dark' | 'light';
  appTemplate?: string;
  premiumIcon?: string;
  primaryColor?: string;
}

function adjustColor(hex: string, amount: number): string {
  let color = hex.replace('#', '');
  if (color.length === 3) color = color.split('').map(c => c + c).join('');
  const num = parseInt(color, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

export default function OrderBumpPreview({ formData, appTheme = 'dark', appTemplate = 'classic', premiumIcon = 'gift', primaryColor = '#4783F6' }: OrderBumpPreviewProps) {
  const [viewMode, setViewMode] = useState<'card' | 'viewer'>('card');
  
  const isDark = appTheme === 'dark';
  const buttonColor = formData.unlock_button_color || '#22c55e';
  const obColor = formData.cor || primaryColor;
  const IconComponent = PREMIUM_ICONS[premiumIcon] || Gift;
  const bullets = [formData.bullet1, formData.bullet2, formData.bullet3].filter(Boolean);

  // Background color based on template/theme (for premium card only)
  const getBgColor = () => {
    if (isDark) {
      const darkBgs: Record<string, string> = {
        classic: '#1a1a1a', corporate: '#1f2937', showcase: '#0f0f23',
        modern: '#0f172a', exclusive: '#0f172a', units: '#1a1625',
        members: '#1a1625', flow: '#0f0a1f', shop: '#000000', academy: '#000000',
      };
      return darkBgs[appTemplate] || '#1a1a1a';
    }
    const lightBgs: Record<string, string> = {
      classic: '#f3f4f6', corporate: '#e5e7eb', showcase: '#ffffff',
      modern: '#ffffff', exclusive: '#ffffff', units: '#E8E3F0',
      members: '#f8f9fa', flow: '#f5f3ff', shop: '#f5f5f5', academy: '#ffffff',
    };
    return lightBgs[appTemplate] || '#f3f4f6';
  };

  const bgColor = getBgColor();

  // Premium Card view (como aparece no app - bloqueado)
  const renderPremiumCard = () => (
    <div 
      className="px-3 py-4 space-y-3"
      style={{ backgroundColor: bgColor }}
    >
      <div 
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
        >
          <IconComponent className="h-4 w-4" style={{ color: obColor }} />
          <h3 
            className="text-sm font-bold tracking-tight"
            style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
          >
            {formData.premium_card_title || "Conteúdo Premium Exclusivo"}
          </h3>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <div className="flex gap-3">
            {formData.premium_image_url && (
              <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                <img src={formData.premium_image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs leading-tight mb-0.5" style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}>
                {formData.label || "Nome do Conteúdo"}
              </h4>
              {formData.description && (
                <p className="text-[10px] leading-relaxed mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)' }}>
                  {formData.description}
                </p>
              )}
              {bullets.length > 0 && (
                <div className="space-y-1">
                  {bullets.map((bullet, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="shrink-0 w-3 h-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${buttonColor}22` }}>
                        <Check className="w-2 h-2" style={{ color: buttonColor }} />
                      </div>
                      <span className="text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)' }}>
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="px-4 pb-4 pt-1">
          <button
            className="w-full py-2.5 px-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5"
            style={{ 
              background: `linear-gradient(180deg, ${buttonColor} 0%, ${adjustColor(buttonColor, -30)} 100%)`,
              boxShadow: `0 4px 14px ${buttonColor}40`,
            }}
          >
            <Lock className="h-3.5 w-3.5" />
            Desbloquear agora
          </button>
        </div>
      </div>
    </div>
  );

  // Viewer (conteúdo desbloqueado) - usa o ThemeRenderer real para garantir consistência visual
  const renderViewer = () => {
    // Map formData to ThemeRenderer's AppData format
    const appData: any = {
      nome: formData.nome || formData.label || "Meu App",
      cor: obColor,
      icone_url: formData.icone_url,
      capa_url: formData.capa_url,
      produto_principal_url: formData.produto_principal_url,
      main_product_label: formData.main_product_label || "Produto Principal",
      main_product_description: formData.main_product_description,
      bonuses_label: formData.bonuses_label || "Bônus Exclusivos",
      mainProductThumbnail: formData.main_product_thumbnail,
      viewButtonLabel: formData.view_button_label || "Ver",
      allow_pdf_download: false,
      // Backgrounds (corporate template)
      mainProductBackground: formData.main_product_background,
      bonus1Background: formData.bonus1_background,
      bonus2Background: formData.bonus2_background,
      bonus3Background: formData.bonus3_background,
      bonus4Background: formData.bonus4_background,
      bonus5Background: formData.bonus5_background,
      bonus6Background: formData.bonus6_background,
      bonus7Background: formData.bonus7_background,
      bonus8Background: formData.bonus8_background,
      bonus9Background: formData.bonus9_background,
      // Template-specific settings from formData (independent per order bump)
      showAppIcon: (formData as any).show_app_icon ?? true,
      showcaseTextPosition: (formData as any).showcase_text_position || 'bottom',
      membersHeaderSize: (formData as any).members_header_size || 'large',
      shopRemoveCardBorder: (formData as any).shop_remove_card_border ?? false,
      membersShowCardBorder: (formData as any).members_show_card_border ?? false,
      flowShowCardBorder: (formData as any).flow_show_card_border ?? false,
      // Visual customization fields - map to ThemeRenderer's AppData field names
      nomeColor: (formData as any).app_name_color || '#ffffff',
      descricao: (formData as any).app_description || '',
      descricaoColor: (formData as any).app_description_color || '#ffffff',
      // Bonus colors (using underscore format matching ThemeRenderer's AppData interface)
      bonus1_color: (formData as any).bonus1_color || null,
      bonus2_color: (formData as any).bonus2_color || null,
      bonus3_color: (formData as any).bonus3_color || null,
      bonus4_color: (formData as any).bonus4_color || null,
      bonus5_color: (formData as any).bonus5_color || null,
      bonus6_color: (formData as any).bonus6_color || null,
      bonus7_color: (formData as any).bonus7_color || null,
      bonus8_color: (formData as any).bonus8_color || null,
      bonus9_color: (formData as any).bonus9_color || null,
      // Academy template carousel covers - use actual training covers from formData
      training1Cover: (formData as any).training1_cover || null,
      training2Cover: (formData as any).training2_cover || null,
      training3Cover: (formData as any).training3_cover || null,
      training4Cover: (formData as any).training4_cover || null,
      // Video Course
      videoCourseEnabled: (formData as any).video_course_enabled ?? false,
      videoModules: (formData as any).video_modules || [],
      videoCourseTitle: (formData as any).video_course_title || 'Curso em Vídeo',
      videoCourseDescription: (formData as any).video_course_description || '',
      videoCourseButtonText: (formData as any).video_course_button_text || 'Assistir Aulas',
      videoCourseImage: (formData as any).video_course_image || null,
      videoCourseBackground: (formData as any).video_course_background || null,
    };

    // Map bonus fields
    for (let i = 1; i <= 9; i++) {
      appData[`bonus${i}_url`] = (formData as any)[`bonus${i}_url`];
      appData[`bonus${i}_label`] = (formData as any)[`bonus${i}_label`] || `Bônus ${i}`;
      appData[`bonus${i}_thumbnail`] = (formData as any)[`bonus${i}_thumbnail`];
    }

    const validTemplate = (appTemplate || 'classic') as "classic" | "corporate" | "showcase" | "modern" | "minimal" | "exclusive" | "units" | "members" | "flow" | "shop" | "academy";

    return (
      <div className="w-full h-full overflow-auto">
        <ThemeRenderer
          template={validTemplate}
          appData={appData}
          appTheme={appTheme}
          isPreview={true}
          userPlanLimits={9}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Template indicator */}
      <div className="text-xs text-muted-foreground">
        Template: <span className="font-medium capitalize">{appTemplate}</span> • Tema: <span className="font-medium capitalize">{appTheme}</span>
      </div>

      {/* Toggle buttons */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'card' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('card')}
          className="text-xs"
        >
          <Gift className="h-3 w-3 mr-1" />
          Card Premium
        </Button>
        <Button
          variant={viewMode === 'viewer' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('viewer')}
          className="text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          App Desbloqueado
        </Button>
      </div>

      {/* Phone mockup */}
      <div className="phone-mockup">
        <div className="phone-screen relative">
          <div className="relative w-full h-full max-w-[280px] mx-auto overflow-auto">
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden">
              {viewMode === 'card' ? renderPremiumCard() : renderViewer()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
