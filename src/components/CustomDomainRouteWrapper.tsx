import { isCustomDomainContext, getCustomDomainAppSlug } from "@/utils/customDomainDetection";
import AppViewer from "@/pages/AppViewer";

interface CustomDomainRouteWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper que verifica se estamos em contexto de domínio customizado.
 * Se sim, e o path atual está mapeado para um app, renderiza o AppViewer.
 * Caso contrário, renderiza a rota normal do Migrabook.
 * 
 * Em domínio customizado, QUALQUER path mapeado mostra o app,
 * pois o domínio é diferente do migrabook.app e não há conflito real.
 */
const CustomDomainRouteWrapper = ({ children }: CustomDomainRouteWrapperProps) => {
  // Verificar se estamos em contexto de domínio customizado
  const isCustomDomain = isCustomDomainContext();
  const appSlug = getCustomDomainAppSlug();
  
  console.log('[CustomDomainRouteWrapper] Verificando contexto:', { 
    currentPath: window.location.pathname,
    isCustomDomain, 
    appSlug,
    hostname: window.location.hostname
  });
  
  // Se estamos em domínio customizado E temos um app mapeado,
  // renderizar o AppViewer ao invés da rota do Migrabook
  if (isCustomDomain && appSlug) {
    console.log('[CustomDomainRouteWrapper] Domínio customizado detectado, renderizando AppViewer para:', appSlug);
    return <AppViewer />;
  }
  
  // Caso contrário, renderizar a rota normal do Migrabook
  return <>{children}</>;
};

export default CustomDomainRouteWrapper;
