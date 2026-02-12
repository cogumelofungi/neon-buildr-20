import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface SocialProofSettings {
  id: string;
  is_enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  interval_seconds: number;
  display_duration_seconds: number;
  min_interval_seconds: number;
  max_interval_seconds: number;
  min_display_seconds: number;
  max_display_seconds: number;
  randomize_order: boolean;
  show_time_ago: boolean;
  show_verified_badge: boolean;
  routes: string[];
  // Pause control
  enable_pause: boolean;
  notifications_before_pause: number;
  pause_duration_seconds: number;
}

interface SocialProofNotification {
  id: string;
  name: string;
  action: string;
  action_type: 'subscribed' | 'created_app' | 'published_app' | 'custom';
  plan_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  display_order: number;
}

// Helper to get random number between min and max
const getRandomBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// LocalStorage key for tracking shown notifications
const SHOWN_NOTIFICATIONS_KEY = 'social_proof_shown_notifications';

// Get shown notification IDs from localStorage
const getShownNotificationIds = (): string[] => {
  try {
    const stored = localStorage.getItem(SHOWN_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save shown notification ID to localStorage
const markNotificationAsShown = (notificationId: string) => {
  try {
    const shown = getShownNotificationIds();
    if (!shown.includes(notificationId)) {
      shown.push(notificationId);
      localStorage.setItem(SHOWN_NOTIFICATIONS_KEY, JSON.stringify(shown));
    }
  } catch (error) {
    console.error('Error saving shown notification:', error);
  }
};

// Filter out already shown notifications
const filterUnshownNotifications = (notifications: SocialProofNotification[]): SocialProofNotification[] => {
  const shownIds = getShownNotificationIds();
  return notifications.filter(n => !shownIds.includes(n.id));
};

// Reset shown notifications (useful when all have been shown)
const resetShownNotifications = () => {
  try {
    localStorage.removeItem(SHOWN_NOTIFICATIONS_KEY);
  } catch (error) {
    console.error('Error resetting shown notifications:', error);
  }
};

export const useSocialProof = () => {
  const location = useLocation();
  const [settings, setSettings] = useState<SocialProofSettings | null>(null);
  const [notifications, setNotifications] = useState<SocialProofNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<SocialProofNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('social_proof_settings' as any)
        .select('*')
        .limit(1)
        .single();

      if (settingsError) {
        console.error('Error fetching social proof settings:', settingsError);
        return;
      }

      setSettings(settingsData as unknown as SocialProofSettings);

      const { data: notificationsData, error: notificationsError } = await supabase
        .from('social_proof_notifications' as any)
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (notificationsError) {
        console.error('Error fetching social proof notifications:', notificationsError);
        return;
      }

      setNotifications((notificationsData || []) as unknown as SocialProofNotification[]);
    } catch (error) {
      console.error('Error in useSocialProof:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const shouldShowOnRoute = useCallback(() => {
    if (!settings || !settings.is_enabled) return false;
    
    const currentPath = location.pathname;
    return settings.routes.some(route => {
      if (route.endsWith('*')) {
        return currentPath.startsWith(route.slice(0, -1));
      }
      return currentPath === route;
    });
  }, [settings, location.pathname]);

  // Format notification action text
  const getFormattedAction = useCallback((notification: SocialProofNotification) => {
    switch (notification.action_type) {
      case 'subscribed':
        return `assinou o plano ${notification.plan_name || 'Premium'}`;
      case 'created_app':
        return 'criou seu primeiro app';
      case 'published_app':
        return 'publicou seu app';
      case 'custom':
      default:
        return notification.action;
    }
  }, []);

  // Cycle through notifications with randomization, pause support, and no repeats
  useEffect(() => {
    if (!settings?.is_enabled || !shouldShowOnRoute() || notifications.length === 0) {
      setIsVisible(false);
      setCurrentNotification(null);
      return;
    }

    // Filter out already shown notifications
    let availableNotifications = filterUnshownNotifications(notifications);
    
    // If all notifications have been shown, reset and start fresh
    if (availableNotifications.length === 0) {
      resetShownNotifications();
      availableNotifications = [...notifications];
    }

    // Prepare notifications order
    let orderedNotifications = settings.randomize_order 
      ? shuffleArray(availableNotifications) 
      : [...availableNotifications];
    
    let currentIndex = 0;
    let notificationsShownInCycle = 0;
    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;
    let pauseTimeout: NodeJS.Timeout;

    const showNextNotification = () => {
      // Re-check available notifications (might have changed)
      const currentAvailable = filterUnshownNotifications(notifications);
      
      // If no more available, reset and reshuffle
      if (currentAvailable.length === 0) {
        resetShownNotifications();
        orderedNotifications = settings.randomize_order 
          ? shuffleArray(notifications) 
          : [...notifications];
        currentIndex = 0;
        notificationsShownInCycle = 0;
      }
      
      // Check if we need to pause
      if (settings.enable_pause && 
          settings.notifications_before_pause > 0 && 
          notificationsShownInCycle >= settings.notifications_before_pause) {
        setIsVisible(false);
        
        // Schedule resume after pause
        pauseTimeout = setTimeout(() => {
          notificationsShownInCycle = 0;
          showNextNotification();
        }, (settings.pause_duration_seconds || 30) * 1000);
        return;
      }

      // Get next unshown notification
      let notification = orderedNotifications[currentIndex];
      const shownIds = getShownNotificationIds();
      
      // Skip already shown notifications
      while (notification && shownIds.includes(notification.id)) {
        currentIndex++;
        if (currentIndex >= orderedNotifications.length) {
          // All have been shown, reset
          resetShownNotifications();
          orderedNotifications = settings.randomize_order 
            ? shuffleArray(notifications) 
            : [...notifications];
          currentIndex = 0;
        }
        notification = orderedNotifications[currentIndex];
      }

      if (!notification) return;

      // Mark as shown
      markNotificationAsShown(notification.id);
      
      setCurrentNotification({
        ...notification,
        action: getFormattedAction(notification),
      });
      setIsVisible(true);
      notificationsShownInCycle++;

      // Random display duration
      const displayDuration = getRandomBetween(
        settings.min_display_seconds,
        settings.max_display_seconds
      ) * 1000;

      hideTimeout = setTimeout(() => {
        setIsVisible(false);
        
        currentIndex++;
        
        // Check if we've gone through all
        if (currentIndex >= orderedNotifications.length) {
          // Reshuffle and reset index
          if (settings.randomize_order) {
            const freshNotifications = filterUnshownNotifications(notifications);
            if (freshNotifications.length === 0) {
              resetShownNotifications();
              orderedNotifications = shuffleArray(notifications);
            } else {
              orderedNotifications = shuffleArray(freshNotifications);
            }
          }
          currentIndex = 0;
        }
        
        // Random interval
        const interval = getRandomBetween(
          settings.min_interval_seconds,
          settings.max_interval_seconds
        ) * 1000;
        
        showTimeout = setTimeout(showNextNotification, interval);
      }, displayDuration);
    };

    // Start quickly for validation
    const initialDelay = Math.min(1000, settings.min_interval_seconds * 1000);
    showTimeout = setTimeout(showNextNotification, initialDelay);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearTimeout(pauseTimeout);
    };
  }, [settings, notifications, shouldShowOnRoute, getFormattedAction]);

  return {
    settings,
    notifications,
    currentNotification,
    isVisible,
    loading,
    shouldShowOnRoute,
    refetch: fetchData,
  };
};

// Admin hook for managing settings
export const useSocialProofAdmin = () => {
  const [settings, setSettings] = useState<SocialProofSettings | null>(null);
  const [notifications, setNotifications] = useState<SocialProofNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('social_proof_settings' as any)
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data as unknown as SocialProofSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('social_proof_notifications' as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setNotifications((data || []) as unknown as SocialProofNotification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const updateSettings = async (updates: Partial<SocialProofSettings>) => {
    if (!settings) return false;

    try {
      const { error } = await supabase
        .from('social_proof_settings' as any)
        .update(updates as any)
        .eq('id', settings.id);

      if (error) throw error;
      await fetchSettings();
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  const addNotification = async (notification: Omit<SocialProofNotification, 'id' | 'display_order'>) => {
    try {
      const maxOrder = Math.max(...notifications.map(n => n.display_order), 0);
      
      const { error } = await supabase
        .from('social_proof_notifications' as any)
        .insert({
          ...notification,
          display_order: maxOrder + 1,
        } as any);

      if (error) throw error;
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Error adding notification:', error);
      return false;
    }
  };

  const updateNotification = async (id: string, updates: Partial<SocialProofNotification>) => {
    try {
      const { error } = await supabase
        .from('social_proof_notifications' as any)
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Error updating notification:', error);
      return false;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_proof_notifications' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSettings(), fetchNotifications()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return {
    settings,
    notifications,
    loading,
    updateSettings,
    addNotification,
    updateNotification,
    deleteNotification,
    refetch: () => Promise.all([fetchSettings(), fetchNotifications()]),
  };
};
