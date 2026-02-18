import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { isCustomDomainContext } from "@/utils/customDomainDetection";
import DomainNotFound from "./DomainNotFound";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const isCustomDomain = isCustomDomainContext();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Se estiver em domínio personalizado, mostrar página estilizada
  if (isCustomDomain) {
    return <DomainNotFound />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">{t("notfound.title")}</h1>
        <p className="text-xl text-muted-foreground mb-4">{t("notfound.message")}</p>
        <a href="/" className="text-primary hover:text-primary/80 underline">
          {t("notfound.home")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
