import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface UserStatus {
  isActive: boolean;
  isLoading: boolean;
  cancellationMessage: string;
  reactivateAccount: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useUserStatus = (): UserStatus => {
  const { user } = useAuthContext();
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellationMessage, setCancellationMessage] = useState('');

  // Evita “flicker” de loading quando o Supabase dispara eventos como TOKEN_REFRESHED
  // (o objeto `user` muda de referência, mas o `user.id` continua igual).
  const lastUserIdRef = useRef<string | null>(null);
  const hasLoadedForUserRef = useRef(false);

  const fetchUserStatus = useCallback(async () => {
    if (!user) {
      lastUserIdRef.current = null;
      hasLoadedForUserRef.current = false;
      setIsLoading(false);
      return;
    }

    const isUserChanged = lastUserIdRef.current !== user.id;
    const shouldShowLoading = isUserChanged || !hasLoadedForUserRef.current;

    if (isUserChanged) {
      lastUserIdRef.current = user.id;
      hasLoadedForUserRef.current = false;
    }

    // Só mostramos tela cheia de loading no carregamento inicial do usuário.
    // Em refresh subsequente (ex.: ao voltar foco), atualiza em background.
    if (shouldShowLoading) {
      setIsLoading(true);
    }
    try {
      console.log('[useUserStatus] Fetching status for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_status')
        .select('is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[useUserStatus] Error fetching status:', error);
        setIsActive(true); // Default para ativo em caso de erro
      } else {
        // Se não encontrar registro, assume ativo (usuário novo)
        const activeStatus = data?.is_active ?? true;
        console.log('[useUserStatus] User status:', { userId: user.id, isActive: activeStatus });
        setIsActive(activeStatus);
      }
    } catch (error) {
      console.error('[useUserStatus] Error:', error);
      setIsActive(true);
    } finally {
      hasLoadedForUserRef.current = true;
      setIsLoading(false);
    }
  }, [user]);

  const fetchCancellationMessage = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'cancellation_message')
        .maybeSingle();

      if (!error && data) {
        setCancellationMessage(data.value);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagem de cancelamento:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserStatus();
      fetchCancellationMessage();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchUserStatus, fetchCancellationMessage]);

  // Subscribe to realtime changes on user_status
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_status',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[useUserStatus] Realtime update received:', payload);
          if (payload.new && typeof payload.new.is_active === 'boolean') {
            setIsActive(payload.new.is_active);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const reactivateAccount = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_status')
        .update({ is_active: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao reativar conta:', error);
        throw error;
      } else {
        setIsActive(true);
      }
    } catch (error) {
      console.error('Erro ao reativar conta:', error);
      throw error;
    }
  };

  return {
    isActive,
    isLoading,
    cancellationMessage,
    reactivateAccount,
    refresh: fetchUserStatus
  };
};
