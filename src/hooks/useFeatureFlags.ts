import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface FeatureFlags {
  uploadModulesVisible: boolean;
  isLoading: boolean;
}

/**
 * Hook para verificar se o usuário atual tem acesso a features controladas por flags.
 * Os dados ficam na tabela admin_settings:
 *   - feature_upload_modules_mode: 'disabled' | 'whitelist' | 'everyone'
 *   - feature_upload_modules_whitelist: JSON array de emails
 */
export const useFeatureFlags = (): FeatureFlags => {
  const { user } = useAuthContext();
  const [uploadModulesVisible, setUploadModulesVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkFlags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['feature_upload_modules_mode', 'feature_upload_modules_whitelist']);

      if (error) {
        console.error('Error fetching feature flags:', error);
        setUploadModulesVisible(false);
        return;
      }

      const settings: Record<string, string> = {};
      data?.forEach(({ key, value }) => { settings[key] = value; });

      const mode = settings['feature_upload_modules_mode'] || 'disabled';

      if (mode === 'everyone') {
        setUploadModulesVisible(true);
      } else if (mode === 'whitelist' && user?.email) {
        try {
          const whitelist: string[] = JSON.parse(settings['feature_upload_modules_whitelist'] || '[]');
          setUploadModulesVisible(whitelist.includes(user.email));
        } catch {
          setUploadModulesVisible(false);
        }
      } else {
        setUploadModulesVisible(false);
      }
    } catch (error) {
      console.error('Error checking feature flags:', error);
      setUploadModulesVisible(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    checkFlags();
  }, [checkFlags]);

  // Listen for changes
  useEffect(() => {
    const channel = supabase
      .channel('feature_flags_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'admin_settings',
        filter: 'key=in.(feature_upload_modules_mode,feature_upload_modules_whitelist)'
      }, () => {
        checkFlags();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [checkFlags]);

  return { uploadModulesVisible, isLoading };
};

/**
 * Hook para admin gerenciar feature flags
 */
export const useFeatureFlagsAdmin = () => {
  const [mode, setMode] = useState<'disabled' | 'whitelist' | 'everyone'>('disabled');
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchFlags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['feature_upload_modules_mode', 'feature_upload_modules_whitelist']);

      if (error) throw error;

      const settings: Record<string, string> = {};
      data?.forEach(({ key, value }) => { settings[key] = value; });

      setMode((settings['feature_upload_modules_mode'] as any) || 'disabled');
      try {
        setWhitelist(JSON.parse(settings['feature_upload_modules_whitelist'] || '[]'));
      } catch {
        setWhitelist([]);
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const saveFlags = async (newMode: typeof mode, newWhitelist: string[]) => {
    setIsSaving(true);
    try {
      // Upsert mode
      await supabase
        .from('admin_settings')
        .upsert({ key: 'feature_upload_modules_mode', value: newMode }, { onConflict: 'key' });

      // Upsert whitelist
      await supabase
        .from('admin_settings')
        .upsert({ key: 'feature_upload_modules_whitelist', value: JSON.stringify(newWhitelist) }, { onConflict: 'key' });

      setMode(newMode);
      setWhitelist(newWhitelist);
      return true;
    } catch (error) {
      console.error('Error saving feature flags:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { mode, whitelist, isLoading, isSaving, saveFlags, refetch: fetchFlags };
};
