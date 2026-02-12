import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PdfViewerType = 'google-docs' | 'react-pdf' | 'adobe-embed' | 'embedpdf';

export interface PdfViewerSettings {
  pdfViewer: PdfViewerType;
  adobeClientId?: string;
  closeButtonColor: string;
  controlsColor: string;
  headerBgColor: string;
  controlsBarColor: string;
}

export const usePdfViewerSetting = () => {
  const [settings, setSettings] = useState<PdfViewerSettings>({ 
    pdfViewer: 'google-docs',
    closeButtonColor: '#ffffff',
    controlsColor: '#ffffff',
    headerBgColor: '#000000',
    controlsBarColor: '#000000'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('key, value')
          .in('key', [
            'pdf_viewer', 
            'adobe_client_id',
            'pdf_close_button_color',
            'pdf_controls_color',
            'pdf_header_bg_color',
            'pdf_controls_bar_color'
          ]);

        if (isMounted) {
          if (!error && data) {
            const pdfViewerSetting = data.find(d => d.key === 'pdf_viewer');
            const adobeClientIdSetting = data.find(d => d.key === 'adobe_client_id');
            const closeButtonColorSetting = data.find(d => d.key === 'pdf_close_button_color');
            const controlsColorSetting = data.find(d => d.key === 'pdf_controls_color');
            const headerBgColorSetting = data.find(d => d.key === 'pdf_header_bg_color');
            const controlsBarColorSetting = data.find(d => d.key === 'pdf_controls_bar_color');
            
            setSettings({
              pdfViewer: (pdfViewerSetting?.value as PdfViewerType) || 'google-docs',
              adobeClientId: adobeClientIdSetting?.value || undefined,
              closeButtonColor: closeButtonColorSetting?.value || '#ffffff',
              controlsColor: controlsColorSetting?.value || '#ffffff',
              headerBgColor: headerBgColorSetting?.value || '#000000',
              controlsBarColor: controlsBarColorSetting?.value || '#000000'
            });
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching PDF viewer settings:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSettings();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { ...settings, isLoading };
};
