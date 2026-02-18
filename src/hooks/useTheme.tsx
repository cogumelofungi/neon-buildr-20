import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Rotas que sempre devem usar tema claro (sem opção de tema escuro)
const LIGHT_ONLY_ROUTES = ["/planos", "/assine", "/acesso", "/assinatura"];

// Função para verificar a rota atual sem usar hooks do React Router
const getDefaultTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    // Se estiver em uma rota de tema fixo, sempre retorna light
    if (LIGHT_ONLY_ROUTES.includes(window.location.pathname)) {
      return "light";
    }
    
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) return savedTheme;
  }
  return "dark";
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getDefaultTheme);

  // Função para definir tema com verificação de rota
  const setTheme = (newTheme: Theme) => {
    const currentPath = window.location.pathname;
    // Se estiver em rota de tema fixo, ignorar tentativas de mudar para dark
    if (LIGHT_ONLY_ROUTES.includes(currentPath) && newTheme === "dark") {
      return;
    }
    setThemeState(newTheme);
  };

  // Forçar tema claro nas rotas específicas - executa sempre que a rota mudar
  useEffect(() => {
    const checkAndForceTheme = () => {
      const currentPath = window.location.pathname;
      if (LIGHT_ONLY_ROUTES.includes(currentPath)) {
        setThemeState("light");
      }
    };
    
    // Verificar imediatamente
    checkAndForceTheme();
    
    // Listener para mudanças de rota
    window.addEventListener("popstate", checkAndForceTheme);
    
    // Observer para detectar mudanças de URL via pushState/replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      checkAndForceTheme();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      checkAndForceTheme();
    };
    
    return () => {
      window.removeEventListener("popstate", checkAndForceTheme);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
