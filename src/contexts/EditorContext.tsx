import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePageConfiguration } from '@/hooks/usePageConfiguration';
import { toast } from 'sonner';

interface ResponsiveStyles {
  desktop?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
  tablet?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
  mobile?: {
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
}

interface ElementStyles {
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  lineHeight?: string;
  letterSpacing?: string;

  width?: string;          // Ex: "w-full", "w-1/2", "w-96"
  maxWidth?: string;       // Ex: "max-w-7xl", "max-w-4xl"
  height?: string;         // Ex: "h-screen", "h-96", "min-h-[500px]"
  minHeight?: string;      // Ex: "min-h-[400px]"
  
  content?: string;        // Conteúdo de texto editável
  
  responsive?: ResponsiveStyles;
}

interface EditorContextType {
  isEditMode: boolean;
  elementStyles: Record<string, ElementStyles>;
  isSaving: boolean;
  toggleEditMode: () => void;
  updateElementStyle: (elementId: string, styles: ElementStyles) => void;
  saveAllChanges: () => Promise<void>;
  resetChanges: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ 
    children,
    pageName = 'default-page' 
  }: { 
    children: ReactNode;
    pageName?: string;
  }) => {

  const [isEditMode, setIsEditMode] = useState(false);
  const [elementStyles, setElementStyles] = useState<Record<string, ElementStyles>>({});
  const [isSaving, setIsSaving] = useState(false);

  // 🔌 Conectar com Supabase
  const { 
    config, 
    isLoading, 
    saveConfiguration, 
    isSaving: isSavingToSupabase 
  } = usePageConfiguration(pageName);

  // 📥 Carregar configurações do Supabase quando disponível
  useEffect(() => {
    if (config && Object.keys(config).length > 0) {
      setElementStyles(config);
    }
  }, [config]);

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
    if (isEditMode) {
      // Ao sair do modo edição, resetar estilos não salvos
      resetChanges();
    }
  };

  const updateElementStyle = (elementId: string, styles: ElementStyles) => {
    setElementStyles(prev => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        ...styles
      }
    }));
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      // 💾 Salvar no Supabase (global para todos!)
      await saveConfiguration(elementStyles);
      setIsEditMode(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    // 🔄 Recarregar do Supabase
    if (config) {
      setElementStyles(config);
    } else {
      setElementStyles({});
    }
  };

  return (
    <EditorContext.Provider
      value={{
        isEditMode,
        elementStyles,
        isSaving: isSaving || isSavingToSupabase,
        toggleEditMode,
        updateElementStyle,
        saveAllChanges,
        resetChanges
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
};
