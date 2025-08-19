import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Language = "pt" | "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Header
    "app.title": "App Builder",
    "language.select": "Idioma",
    "theme.light": "Claro",
    "theme.dark": "Escuro",
    "reset": "Reset",
    "publish": "Publicar App",

    // Progress
    "progress.upload": "Upload",
    "progress.customization": "Personalização", 
    "progress.publish": "Publicar",

    // Upload Section
    "upload.title": "Upload de Produtos",
    "upload.main": "Produto Principal",
    "upload.main.desc": "PDF ou ZIP do produto principal",
    "upload.bonus": "Bônus",
    "upload.bonus.desc": "Material adicional (PDF, ZIP)",
    "upload.send": "Enviar",
    "import.title": "Importar App Existente",
    "import.json": "Upload via JSON",
    "import.json.placeholder": "Cole o JSON do app...",
    "import.id": "Importar por ID",
    "import.id.placeholder": "ID do app...",
    "import.button": "Importar",

    // Phone Preview
    "preview.title": "Pré-visualização do App",

    // Customization
    "custom.title": "Personalização do App",
    "custom.name": "Nome do App",
    "custom.name.placeholder": "Digite o nome do seu app",
    "custom.color": "Cor do App",
    "custom.icon": "Ícone do App",
    "custom.icon.upload": "Enviar Ícone",
    "custom.cover": "Capa do App", 
    "custom.cover.upload": "Enviar Capa",
    "custom.link": "Link Personalizado",
    "custom.link.placeholder": "Sua URL aqui",
    "custom.link.help": "Se deixar em branco vai gerar uma URL automática",
    "custom.reset": "Resetar Personalização",

    // Phone mockup
    "phone.main.title": "PRODUTO PRINCIPAL",
    "phone.main.subtitle": "Baixe agora e comece a transformar seus resultados",
    "phone.bonus.title": "BÔNUS EXCLUSIVOS",
    "phone.view": "Visualizar",

    // Admin Panel
    "admin.title": "Painel Administrativo",
    "admin.subtitle": "Controle total da plataforma",
    "admin.students": "Alunos",
    "admin.settings": "Configurações", 
    "admin.integrations": "Integrações",
    "admin.apps": "Gerenciar Apps",
    "admin.logout": "Sair",
    "admin.students.title": "Gerenciamento de Alunos",
    "admin.students.subtitle": "Controle de acesso e monitoramento de usuários",
    "admin.students.active": "ativos",
    "admin.students.search": "Buscar por email...",
    "admin.students.all": "Todos",
    "admin.students.active.filter": "Ativos",
    "admin.students.inactive": "Inativos",
    "admin.students.email": "Email",
    "admin.students.phone": "Telefone",
    "admin.students.plan": "Plano",
    "admin.students.apps": "Apps Publicados",
    "admin.students.status": "Status",
    "admin.students.created": "Data de Cadastro",
    "admin.students.actions": "Ações",
    "admin.students.details": "Ver Detalhes",
    "admin.settings.title": "Configurações do Sistema",
    "admin.settings.subtitle": "Gerencie as configurações globais da plataforma",
    "admin.settings.save": "Salvar Configurações",
    "admin.settings.language": "Idioma Padrão do Sistema",
    "admin.settings.language.placeholder": "Selecione o idioma",
    "admin.settings.terms": "Termos de Uso",
    "admin.settings.terms.placeholder": "Digite os termos de uso da plataforma...",
    "admin.settings.cancellation": "Mensagem de Cancelamento",
    "admin.settings.cancellation.placeholder": "Mensagem exibida quando o acesso é cancelado...",
    "admin.settings.cancellation.help": "Esta mensagem será exibida nos apps de usuários com acesso desativado",

    // Admin Login
    "admin.login.title": "Painel Admin",
    "admin.login.subtitle": "Acesso exclusivo para administradores",
    "admin.login.email": "Email",
    "admin.login.password": "Senha",
    "admin.login.submit": "Entrar",
    "admin.login.loading": "Entrando...",

    // Integrations
    "integrations.title": "Integrações",
    "integrations.subtitle": "Configure integrações com serviços externos",
    "integrations.save": "Salvar Configurações",
    "integrations.saving": "Salvando...",
    "integrations.activecampaign.title": "ActiveCampaign",
    "integrations.activecampaign.subtitle": "Automação de email marketing",
    "integrations.activecampaign.api_url": "API URL",
    "integrations.activecampaign.api_url.placeholder": "https://sua-conta.api-us1.com",
    "integrations.activecampaign.api_key": "API Key",
    "integrations.activecampaign.api_key.placeholder": "sua-chave-da-api",
    "integrations.make.title": "Make",
    "integrations.make.subtitle": "Automação de processos",
    "integrations.make.webhook_url": "Webhook URL",
    "integrations.make.webhook_url.placeholder": "https://hook.integromat.com/...",

    // Toast Messages
    "toast.logout.error.title": "Erro no logout",
    "toast.logout.error.description": "Não foi possível fazer logout",
    "toast.logout.success.title": "Logout realizado",
    "toast.logout.success.description": "Você foi desconectado com sucesso",
    "toast.login.error.title": "Erro no login",
    "toast.login.error.description": "Erro inesperado. Tente novamente.",
    "toast.login.success.title": "Login realizado com sucesso",
    "toast.login.success.description": "Verificando permissões administrativas...",
    "toast.validation.title": "Dados inválidos",
    "toast.copy.success.title": "Copiado!",
    "toast.copy.success.description": "O link foi copiado para a área de transferência.",
    "toast.copy.error.title": "Erro",
    "toast.copy.error.description": "Não foi possível copiar o link.",
    "toast.save.success.title": "Configurações salvas",
    "toast.save.success.description": "As integrações foram configuradas com sucesso",
    "toast.error.title": "Erro",
    "toast.error.description": "Ocorreu um erro inesperado",

    // Common
    "common.loading": "Carregando...",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.close": "Fechar",
    "common.edit": "Editar",
    "common.delete": "Deletar",
    "common.view": "Visualizar",
    "common.download": "Baixar",
    "common.upload": "Enviar",
    "common.active": "Ativo",
    "common.inactive": "Inativo",
    "common.yes": "Sim",
    "common.no": "Não",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.all": "Todos",

    // Validation
    "validation.email.invalid": "Email inválido",
    "validation.password.min": "Senha deve ter pelo menos 6 caracteres",
    "validation.required": "Este campo é obrigatório",

    // Status Messages
    "status.checking_permissions": "Verificando permissões...",
    "status.loading_data": "Carregando dados...",
    "status.saving": "Salvando...",
    "status.uploading": "Enviando...",
  },
  en: {
    // Header
    "app.title": "App Builder",
    "language.select": "Language",
    "theme.light": "Light",
    "theme.dark": "Dark", 
    "reset": "Reset",
    "publish": "Publish App",

    // Progress
    "progress.upload": "Upload",
    "progress.customization": "Customization",
    "progress.publish": "Publish",

    // Upload Section
    "upload.title": "Product Upload",
    "upload.main": "Main Product",
    "upload.main.desc": "PDF or ZIP of main product",
    "upload.bonus": "Bonus",
    "upload.bonus.desc": "Additional material (PDF, ZIP)",
    "upload.send": "Send",
    "import.title": "Import Existing App",
    "import.json": "Upload via JSON",
    "import.json.placeholder": "Paste the app JSON...",
    "import.id": "Import by ID",
    "import.id.placeholder": "App ID...",
    "import.button": "Import",

    // Phone Preview
    "preview.title": "App Preview",

    // Customization
    "custom.title": "App Customization",
    "custom.name": "App Name",
    "custom.name.placeholder": "Enter your app name",
    "custom.color": "App Color",
    "custom.icon": "App Icon",
    "custom.icon.upload": "Upload Icon",
    "custom.cover": "App Cover",
    "custom.cover.upload": "Upload Cover",
    "custom.link": "Custom Link",
    "custom.link.placeholder": "Your URL here",
    "custom.link.help": "Leave blank for automatic URL generation",
    "custom.reset": "Reset Customization",

    // Phone mockup
    "phone.main.title": "MAIN PRODUCT",
    "phone.main.subtitle": "Download now and start transforming your results",
    "phone.bonus.title": "EXCLUSIVE BONUSES",
    "phone.view": "View",

    // Admin Panel
    "admin.title": "Admin Panel",
    "admin.subtitle": "Complete platform control",
    "admin.students": "Students",
    "admin.settings": "Settings",
    "admin.integrations": "Integrations",
    "admin.apps": "Manage Apps",
    "admin.logout": "Logout",
    "admin.students.title": "Student Management",
    "admin.students.subtitle": "Access control and user monitoring",
    "admin.students.active": "active",
    "admin.students.search": "Search by email...",
    "admin.students.all": "All",
    "admin.students.active.filter": "Active",
    "admin.students.inactive": "Inactive",
    "admin.students.email": "Email",
    "admin.students.phone": "Phone",
    "admin.students.plan": "Plan",
    "admin.students.apps": "Published Apps",
    "admin.students.status": "Status",
    "admin.students.created": "Registration Date",
    "admin.students.actions": "Actions",
    "admin.students.details": "View Details",
    "admin.settings.title": "System Settings",
    "admin.settings.subtitle": "Manage global platform settings",
    "admin.settings.save": "Save Settings",
    "admin.settings.language": "Default System Language",
    "admin.settings.language.placeholder": "Select language",
    "admin.settings.terms": "Terms of Use",
    "admin.settings.terms.placeholder": "Enter platform terms of use...",
    "admin.settings.cancellation": "Cancellation Message",
    "admin.settings.cancellation.placeholder": "Message displayed when access is cancelled...",
    "admin.settings.cancellation.help": "This message will be displayed in apps of users with deactivated access",

    // Admin Login
    "admin.login.title": "Admin Panel",
    "admin.login.subtitle": "Exclusive access for administrators",
    "admin.login.email": "Email",
    "admin.login.password": "Password",
    "admin.login.submit": "Login",
    "admin.login.loading": "Logging in...",

    // Integrations
    "integrations.title": "Integrations",
    "integrations.subtitle": "Configure integrations with external services",
    "integrations.save": "Save Settings",
    "integrations.saving": "Saving...",
    "integrations.activecampaign.title": "ActiveCampaign",
    "integrations.activecampaign.subtitle": "Email marketing automation",
    "integrations.activecampaign.api_url": "API URL",
    "integrations.activecampaign.api_url.placeholder": "https://your-account.api-us1.com",
    "integrations.activecampaign.api_key": "API Key",
    "integrations.activecampaign.api_key.placeholder": "your-api-key",
    "integrations.make.title": "Make",
    "integrations.make.subtitle": "Process automation",
    "integrations.make.webhook_url": "Webhook URL",
    "integrations.make.webhook_url.placeholder": "https://hook.integromat.com/...",

    // Toast Messages
    "toast.logout.error.title": "Logout Error",
    "toast.logout.error.description": "Could not logout",
    "toast.logout.success.title": "Logged Out",
    "toast.logout.success.description": "You have been successfully logged out",
    "toast.login.error.title": "Login Error",
    "toast.login.error.description": "Unexpected error. Please try again.",
    "toast.login.success.title": "Login Successful",
    "toast.login.success.description": "Checking administrative permissions...",
    "toast.validation.title": "Invalid Data",
    "toast.copy.success.title": "Copied!",
    "toast.copy.success.description": "The link has been copied to clipboard.",
    "toast.copy.error.title": "Error",
    "toast.copy.error.description": "Could not copy the link.",
    "toast.save.success.title": "Settings Saved",
    "toast.save.success.description": "Integrations have been configured successfully",
    "toast.error.title": "Error",
    "toast.error.description": "An unexpected error occurred",

    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.close": "Close",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.yes": "Yes",
    "common.no": "No",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",

    // Validation
    "validation.email.invalid": "Invalid email",
    "validation.password.min": "Password must be at least 6 characters",
    "validation.required": "This field is required",

    // Status Messages
    "status.checking_permissions": "Checking permissions...",
    "status.loading_data": "Loading data...",
    "status.saving": "Saving...",
    "status.uploading": "Uploading...",
  },
  es: {
    // Header
    "app.title": "App Builder",
    "language.select": "Idioma",
    "theme.light": "Claro",
    "theme.dark": "Oscuro",
    "reset": "Resetear",
    "publish": "Publicar App",

    // Progress
    "progress.upload": "Upload",
    "progress.customization": "Personalización",
    "progress.publish": "Publicar",

    // Upload Section
    "upload.title": "Subida de Productos",
    "upload.main": "Producto Principal",
    "upload.main.desc": "PDF o ZIP del producto principal",
    "upload.bonus": "Bono",
    "upload.bonus.desc": "Material adicional (PDF, ZIP)",
    "upload.send": "Enviar",
    "import.title": "Importar App Existente",
    "import.json": "Subir via JSON",
    "import.json.placeholder": "Pega el JSON de la app...",
    "import.id": "Importar por ID",
    "import.id.placeholder": "ID de la app...",
    "import.button": "Importar",

    // Phone Preview
    "preview.title": "Vista Previa de la App",

    // Customization
    "custom.title": "Personalización de la App",
    "custom.name": "Nombre de la App",
    "custom.name.placeholder": "Ingresa el nombre de tu app",
    "custom.color": "Color de la App",
    "custom.icon": "Ícono de la App",
    "custom.icon.upload": "Subir Ícono",
    "custom.cover": "Portada de la App",
    "custom.cover.upload": "Subir Portada",
    "custom.link": "Enlace Personalizado",
    "custom.link.placeholder": "Tu URL aquí",
    "custom.link.help": "Dejar en blanco para generar URL automática",
    "custom.reset": "Resetear Personalización",

    // Phone mockup
    "phone.main.title": "PRODUCTO PRINCIPAL",
    "phone.main.subtitle": "Descarga ahora y comienza a transformar tus resultados",
    "phone.bonus.title": "BONOS EXCLUSIVOS",
    "phone.view": "Ver",

    // Admin Panel
    "admin.title": "Panel Administrativo",
    "admin.subtitle": "Control total de la plataforma",
    "admin.students": "Estudiantes",
    "admin.settings": "Configuraciones",
    "admin.integrations": "Integraciones",
    "admin.apps": "Gestionar Apps",
    "admin.logout": "Salir",
    "admin.students.title": "Gestión de Estudiantes",
    "admin.students.subtitle": "Control de acceso y monitoreo de usuarios",
    "admin.students.active": "activos",
    "admin.students.search": "Buscar por email...",
    "admin.students.all": "Todos",
    "admin.students.active.filter": "Activos",
    "admin.students.inactive": "Inactivos",
    "admin.students.email": "Email",
    "admin.students.phone": "Teléfono",
    "admin.students.plan": "Plan",
    "admin.students.apps": "Apps Publicadas",
    "admin.students.status": "Estado",
    "admin.students.created": "Fecha de Registro",
    "admin.students.actions": "Acciones",
    "admin.students.details": "Ver Detalles",
    "admin.settings.title": "Configuraciones del Sistema",
    "admin.settings.subtitle": "Gestionar configuraciones globales de la plataforma",
    "admin.settings.save": "Guardar Configuraciones",
    "admin.settings.language": "Idioma Predeterminado del Sistema",
    "admin.settings.language.placeholder": "Seleccionar idioma",
    "admin.settings.terms": "Términos de Uso",
    "admin.settings.terms.placeholder": "Ingrese los términos de uso de la plataforma...",
    "admin.settings.cancellation": "Mensaje de Cancelación",
    "admin.settings.cancellation.placeholder": "Mensaje mostrado cuando el acceso es cancelado...",
    "admin.settings.cancellation.help": "Este mensaje se mostrará en las apps de usuarios con acceso desactivado",

    // Admin Login
    "admin.login.title": "Panel Admin",
    "admin.login.subtitle": "Acceso exclusivo para administradores",
    "admin.login.email": "Email",
    "admin.login.password": "Contraseña",
    "admin.login.submit": "Entrar",
    "admin.login.loading": "Entrando...",

    // Integrations
    "integrations.title": "Integraciones",
    "integrations.subtitle": "Configurar integraciones con servicios externos",
    "integrations.save": "Guardar Configuraciones",
    "integrations.saving": "Guardando...",
    "integrations.activecampaign.title": "ActiveCampaign",
    "integrations.activecampaign.subtitle": "Automatización de email marketing",
    "integrations.activecampaign.api_url": "API URL",
    "integrations.activecampaign.api_url.placeholder": "https://tu-cuenta.api-us1.com",
    "integrations.activecampaign.api_key": "API Key",
    "integrations.activecampaign.api_key.placeholder": "tu-clave-api",
    "integrations.make.title": "Make",
    "integrations.make.subtitle": "Automatización de procesos",
    "integrations.make.webhook_url": "Webhook URL",
    "integrations.make.webhook_url.placeholder": "https://hook.integromat.com/...",

    // Toast Messages
    "toast.logout.error.title": "Error de Logout",
    "toast.logout.error.description": "No se pudo cerrar sesión",
    "toast.logout.success.title": "Sesión Cerrada",
    "toast.logout.success.description": "Has cerrado sesión exitosamente",
    "toast.login.error.title": "Error de Login",
    "toast.login.error.description": "Error inesperado. Inténtalo de nuevo.",
    "toast.login.success.title": "Login Exitoso",
    "toast.login.success.description": "Verificando permisos administrativos...",
    "toast.validation.title": "Datos Inválidos",
    "toast.copy.success.title": "¡Copiado!",
    "toast.copy.success.description": "El enlace ha sido copiado al portapapeles.",
    "toast.copy.error.title": "Error",
    "toast.copy.error.description": "No se pudo copiar el enlace.",
    "toast.save.success.title": "Configuraciones Guardadas",
    "toast.save.success.description": "Las integraciones han sido configuradas exitosamente",
    "toast.error.title": "Error",
    "toast.error.description": "Ocurrió un error inesperado",

    // Common
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.close": "Cerrar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.view": "Ver",
    "common.download": "Descargar",
    "common.upload": "Subir",
    "common.active": "Activo",
    "common.inactive": "Inactivo",
    "common.yes": "Sí",
    "common.no": "No",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.all": "Todos",

    // Validation
    "validation.email.invalid": "Email inválido",
    "validation.password.min": "La contraseña debe tener al menos 6 caracteres",
    "validation.required": "Este campo es obligatorio",

    // Status Messages
    "status.checking_permissions": "Verificando permisos...",
    "status.loading_data": "Cargando datos...",
    "status.saving": "Guardando...",
    "status.uploading": "Subiendo...",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt");

  // Fetch default language from admin settings
  useEffect(() => {
    const fetchDefaultLanguage = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'default_language')
          .single();
        
        if (!error && data?.value) {
          setLanguage(data.value as Language);
        }
      } catch (error) {
        console.error('Error fetching default language:', error);
      }
    };

    fetchDefaultLanguage();
  }, []);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};