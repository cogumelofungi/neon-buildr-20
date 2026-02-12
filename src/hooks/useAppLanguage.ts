// Hook para tradução baseada no idioma salvo no app (theme_config)
// Usado apenas no AppViewer para garantir que apps publicados usem o idioma correto

type Language = "pt" | "en" | "es";

// Traduções específicas para o app publicado (PWA, notificações, etc)
const appTranslations = {
  pt: {
    "app.error": "Erro",
    "app.error_loading": "Erro ao carregar o app:",
    "app.not_found": "App não encontrado",
    "app.not_found_desc": "O aplicativo que você está procurando não existe ou foi removido.",
    "app.unexpected_error": "Erro inesperado",
    "app.unexpected_error_desc": "Ocorreu um erro inesperado. Tente novamente mais tarde.",
    "app.install_error": "Erro na instalação",
    "app.install_error_desc": "Não foi possível iniciar a instalação. Use o menu do navegador.",
    "app.install_try_again": "Tente novamente",
    "app.installed": "App instalado!",
    "app.installed_desc": "O aplicativo foi adicionado à sua tela inicial.",
    "app.install_cancelled": "Instalação cancelada",
    "app.install_cancelled_desc": "Você pode instalar o app mais tarde.",
    "app.new_notification": "Nova notificação",
    "app.dismiss": "Dispensar",
    "app.view": "Ver",
    "app.loading": "Carregando...",
    "pwa.install.title": "Instalar Aplicativo",
    "pwa.install.app": "Aplicativo",
    "pwa.install.follow": "Siga os passos abaixo:",
    "pwa.install.understood": "Entendi",
    "pwa.install.one_tap": "Instale com um toque",
    "pwa.install.add": "Adicione à sua tela inicial",
    "pwa.install.now": "Instalar",
    "pwa.install.how": "Como instalar",
    "pwa.install.later": "Depois",
    "pwa.copy.link": "Copiar link",
    // ThemeRenderer notifications
    "notifications.new_notification": "Nova notificação",
    "notifications.default_button_text": "Acessar Oferta",
  },
  en: {
    "app.error": "Error",
    "app.error_loading": "Error loading app:",
    "app.not_found": "App not found",
    "app.not_found_desc": "The app you're looking for doesn't exist or has been removed.",
    "app.unexpected_error": "Unexpected error",
    "app.unexpected_error_desc": "An unexpected error occurred. Please try again later.",
    "app.install_error": "Installation error",
    "app.install_error_desc": "Could not start installation. Use the browser menu.",
    "app.install_try_again": "Try again",
    "app.installed": "App installed!",
    "app.installed_desc": "The app has been added to your home screen.",
    "app.install_cancelled": "Installation cancelled",
    "app.install_cancelled_desc": "You can install the app later.",
    "app.new_notification": "New notification",
    "app.dismiss": "Dismiss",
    "app.view": "View",
    "app.loading": "Loading...",
    "pwa.install.title": "Install App",
    "pwa.install.app": "App",
    "pwa.install.follow": "Follow the steps below:",
    "pwa.install.understood": "Got it",
    "pwa.install.one_tap": "Install with one tap",
    "pwa.install.add": "Add to your home screen",
    "pwa.install.now": "Install",
    "pwa.install.how": "How to install",
    "pwa.install.later": "Later",
    "pwa.copy.link": "Copy link",
    // ThemeRenderer notifications
    "notifications.new_notification": "New notification",
    "notifications.default_button_text": "Access Offer",
  },
  es: {
    "app.error": "Error",
    "app.error_loading": "Error al cargar la app:",
    "app.not_found": "App no encontrada",
    "app.not_found_desc": "La aplicación que buscas no existe o ha sido eliminada.",
    "app.unexpected_error": "Error inesperado",
    "app.unexpected_error_desc": "Ocurrió un error inesperado. Inténtalo más tarde.",
    "app.install_error": "Error de instalación",
    "app.install_error_desc": "No se pudo iniciar la instalación. Usa el menú del navegador.",
    "app.install_try_again": "Intentar de nuevo",
    "app.installed": "¡App instalada!",
    "app.installed_desc": "La aplicación se añadió a tu pantalla de inicio.",
    "app.install_cancelled": "Instalación cancelada",
    "app.install_cancelled_desc": "Puedes instalar la app más tarde.",
    "app.new_notification": "Nueva notificación",
    "app.dismiss": "Descartar",
    "app.view": "Ver",
    "app.loading": "Cargando...",
    "pwa.install.title": "Instalar Aplicación",
    "pwa.install.app": "Aplicación",
    "pwa.install.follow": "Sigue los pasos:",
    "pwa.install.understood": "Entendido",
    "pwa.install.one_tap": "Instala con un toque",
    "pwa.install.add": "Añade a tu pantalla de inicio",
    "pwa.install.now": "Instalar",
    "pwa.install.how": "Cómo instalar",
    "pwa.install.later": "Después",
    "pwa.copy.link": "Copiar enlace",
    // ThemeRenderer notifications
    "notifications.new_notification": "Nueva notificación",
    "notifications.default_button_text": "Acceder a Oferta",
  },
};

export const getAppTranslation = (language: Language | undefined) => {
  const lang: Language = language && ["pt", "en", "es"].includes(language) ? language : "pt";
  
  return (key: string): string => {
    return appTranslations[lang][key as keyof (typeof appTranslations)[typeof lang]] || key;
  };
};

export const parseAppLanguage = (themeConfig: any): Language | undefined => {
  if (!themeConfig) return undefined;
  
  try {
    const config = typeof themeConfig === 'string' ? JSON.parse(themeConfig) : themeConfig;
    if (config?.appLanguage && ["pt", "en", "es"].includes(config.appLanguage)) {
      return config.appLanguage as Language;
    }
  } catch (e) {
    console.error('[AppLanguage] Erro ao parsear theme_config:', e);
  }
  
  return undefined;
};
