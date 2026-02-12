import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomScript {
  id: string;
  name: string;
  script_code: string;
  routes: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface CreateScriptData {
  name: string;
  script_code: string;
  routes: string[];
  is_active?: boolean;
}

interface UpdateScriptData {
  name?: string;
  script_code?: string;
  routes?: string[];
  is_active?: boolean;
}

export const useCustomScripts = () => {
  const [scripts, setScripts] = useState<CustomScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScripts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('custom_scripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createScript = async (scriptData: CreateScriptData) => {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('custom_scripts')
      .insert({
        name: scriptData.name,
        script_code: scriptData.script_code,
        routes: scriptData.routes,
        is_active: scriptData.is_active ?? true,
        created_by: userData?.user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    setScripts(prev => [data, ...prev]);
    return data;
  };

  const updateScript = async (id: string, updates: UpdateScriptData) => {
    const { data, error } = await supabase
      .from('custom_scripts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    setScripts(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };

  const deleteScript = async (id: string) => {
    const { error } = await supabase
      .from('custom_scripts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    setScripts(prev => prev.filter(s => s.id !== id));
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  return {
    scripts,
    isLoading,
    fetchScripts,
    createScript,
    updateScript,
    deleteScript,
  };
};

// Hook for getting scripts for a specific route (for injection)
export const useRouteScripts = (currentRoute: string) => {
  const [scripts, setScripts] = useState<CustomScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRouteScripts = async () => {
      try {
        console.log('[useRouteScripts] Fetching scripts for route:', currentRoute);
        
        const { data, error } = await supabase
          .from('custom_scripts')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        console.log('[useRouteScripts] All active scripts from DB:', data);
        console.log('[useRouteScripts] Looking for route:', currentRoute);

        // Filter scripts that match the current route.
        // Uses startsWith to match sub-routes (e.g., /acesso matches /acesso/something)
        //
        // 🔒 Segurança/estabilidade: em rotas sensíveis (login/admin), NÃO aplicamos scripts com wildcard (*)
        // para evitar que scripts de terceiros quebrem o fluxo de autenticação.
        const sensitiveRoutes = new Set(['/login', '/auth', '/admin', '/configurar-senha']);
        const isSensitiveRoute = sensitiveRoutes.has(currentRoute);

        const matchingScripts = (data || []).filter((script: CustomScript) => {
          const hasWildcard = script.routes.includes('*');
          const hasExplicitMatch = script.routes.some((route) =>
            currentRoute === route || currentRoute.startsWith(route + '/')
          );

          const matches = isSensitiveRoute ? hasExplicitMatch : (hasWildcard || hasExplicitMatch);

          console.log(`[useRouteScripts] Script "${script.name}" routes:`, script.routes, 'matches:', matches);
          return matches;
        });

        console.log('[useRouteScripts] Matching scripts:', matchingScripts.length);
        setScripts(matchingScripts);
      } catch (error) {
        console.error('[useRouteScripts] Error fetching route scripts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteScripts();
  }, [currentRoute]);

  return { scripts, isLoading };
};
