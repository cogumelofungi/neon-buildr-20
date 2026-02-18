import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { RotateCcw, Globe, Sun, Moon, LogOut, Menu, User, ArrowLeft, Bell } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ProfileDialog } from "@/components/ProfileDialog";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useIsTabletOrMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationDropdown from "@/components/NotificationDropdown";

interface HeaderProps {
  onResetApp?: () => void;
}

const Header = ({ onResetApp }: HeaderProps) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuthContext();
  const { toast } = useToast();
  const { platformName } = usePlatformSettings();
  const isTabletOrMobile = useIsTabletOrMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAcademyPage = location.pathname === '/academy';
  const isAccessPage = location.pathname === '/acesso';
  
  // Rotas que sempre usam tema claro (sem toggle de tema)
  const LIGHT_ONLY_ROUTES = ["/planos", "/assine", "/acesso", "/assinatura"];
  const isLightOnlyRoute = LIGHT_ONLY_ROUTES.includes(location.pathname);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: t("header.logout.error.title"),
        description: t("header.logout.error.description"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("header.logout.success.title"),
        description: t("header.logout.success.description"),
      });
      navigate('/login');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-app-surface/95 backdrop-blur-sm border-b border-app-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={theme === "light" ? "/migrabook-favicon.png" : "/migrabook-logo.png"}
            alt="Logo" 
            className="w-10 h-10 rounded-lg object-cover"
          />
          <h1 className="text-xl font-bold text-foreground">{platformName}</h1>
          
          {/* Back to App button for Academy page */}
          {isAcademyPage && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/app')}
              className="ml-4"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("header.back_to_app") || "Voltar ao App"}</span>
              <span className="sm:hidden">{t("checkout.back.short") || "Voltar"}</span>
            </Button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          {isTabletOrMobile ? (
            /* Menu Dropdown para Mobile/Tablet */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-[#4384F4] hover:bg-[#1EAEDB] text-white h-9 px-3"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background">
                {/* Idioma - Submenu (hidden on /acesso) */}
                {!isAccessPage && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Globe className="h-4 w-4 mr-2" />
                      {t("header.language")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setLanguage("pt")}>
                        {t("header.language.pt")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("en")}>
                        {t("header.language.en")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("es")}>
                        {t("header.language.es")}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                
                {/* Tema - esconde em rotas de tema fixo */}
                {!isLightOnlyRoute && (
                  <DropdownMenuItem onClick={toggleTheme}>
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        {t("header.theme")}
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        {t("header.theme")}
                      </>
                    )}
                  </DropdownMenuItem>
                )}

                {/* Notificações - Mobile */}
                <div className="px-2 py-3">
                  <NotificationDropdown showLabel />
                </div>
                
                {/* Perfil */}
                <ProfileDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <User className="h-4 w-4 mr-2" />
                    <span>{t("header.profile")}</span>
                  </DropdownMenuItem>
                </ProfileDialog>
                
                
                {/* Logout */}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("header.logout.button")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Controles Normais para Desktop */
            <>
              {/* Language Selector (hidden on /acesso) */}
              {!isAccessPage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Globe className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setLanguage("pt")}>
                      {t("header.language.pt")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("en")}>
                      {t("header.language.en")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("es")}>
                      {t("header.language.es")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Notifications */}
              <NotificationDropdown />
        
              {/* Theme Toggle - esconde em rotas de tema fixo */}
              {!isLightOnlyRoute && (
                <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}
        
              {/* Profile */}
              <ProfileDialog />
        
        
              {/* Logout */}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 p-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
