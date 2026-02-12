import { useEffect } from "react";

const UTM_PARAMS = [
  "ld_app_utm_source",
  "ld_app_utm_medium",
  "ld_app_utm_campaign",
  "ld_app_utm_term",
  "ld_app_utm_content",
] as const;

const UTM_STORAGE_KEY = "migrabook_utm_data";

export interface UtmData {
  ld_app_utm_source?: string;
  ld_app_utm_medium?: string;
  ld_app_utm_campaign?: string;
  ld_app_utm_term?: string;
  ld_app_utm_content?: string;
}

/**
 * Hook para capturar parâmetros UTM da URL e salvá-los no sessionStorage.
 * Os UTMs são preservados durante a navegação até fechar a aba.
 */
export const useUtmCapture = () => {
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmData: UtmData = {};
      let hasNewUtms = false;

      UTM_PARAMS.forEach((param) => {
        const value = urlParams.get(param);
        if (value) {
          utmData[param] = value;
          hasNewUtms = true;
        }
      });

      // Só atualizar se houver novos UTMs na URL
      if (hasNewUtms) {
        // Mesclar com UTMs existentes (novos sobrescrevem antigos)
        const existingData = getUtmData();
        const mergedData = { ...existingData, ...utmData };
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(mergedData));
        console.log("[UTM] Captured UTM params:", mergedData);
      }
    } catch (error) {
      console.warn("[UTM] Error capturing UTM params:", error);
    }
  }, []);
};

/**
 * Recupera os dados UTM salvos no sessionStorage.
 */
export const getUtmData = (): UtmData => {
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("[UTM] Error reading UTM data:", error);
  }
  return {};
};
