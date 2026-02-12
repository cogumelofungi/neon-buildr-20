import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationRead {
  notification_id: string;
  read_at: string;
}

export const useNotifications = () => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []) as unknown as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchReadNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_notification_reads' as any)
        .select('notification_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const readIds = new Set((data || []).map((r: any) => r.notification_id));
      setReadNotifications(readIds);
    } catch (error) {
      console.error('Error fetching read notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user || readNotifications.has(notificationId)) return;

    try {
      const { error } = await supabase
        .from('user_notification_reads' as any)
        .insert({
          user_id: user.id,
          notification_id: notificationId,
        } as any);

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }
      
      setReadNotifications(prev => new Set([...prev, notificationId]));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const unreadIds = notifications
      .filter(n => !readNotifications.has(n.id))
      .map(n => n.id);

    if (unreadIds.length === 0) return;

    try {
      const inserts = unreadIds.map(notification_id => ({
        user_id: user.id,
        notification_id,
      }));

      const { error } = await supabase
        .from('user_notification_reads' as any)
        .insert(inserts as any);

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      setReadNotifications(prev => new Set([...prev, ...unreadIds]));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchNotifications();
      if (user) {
        await fetchReadNotifications();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  return {
    notifications,
    readNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
