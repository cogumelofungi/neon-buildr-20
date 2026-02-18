import { useState } from 'react';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  created_at: string;
}

interface NotificationDropdownProps {
  showLabel?: boolean;
}

const NotificationDropdown = ({ showLabel = false }: NotificationDropdownProps) => {
  const { notifications, readNotifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const { t, language } = useLanguage();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const getLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'es': return es;
      default: return ptBR;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={showLabel ? "h-auto p-0 flex items-center gap-2 text-sm font-normal hover:bg-transparent" : "h-8 w-8 p-0 relative"}>
            <Bell className="h-4 w-4" />
            {showLabel && <span>{t("header.notifications")}</span>}
            {!loading && unreadCount > 0 && !showLabel && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {!loading && unreadCount > 0 && showLabel && (
              <span className="h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-background">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="font-semibold text-sm">{t('header.notifications.dropdown_title')}</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                {t('header.notifications.mark_all_read')}
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t('header.notifications.empty')}
              </div>
            ) : (
              notifications.map((notification) => {
                const isRead = readNotifications.has(notification.id);
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start p-3 cursor-pointer ${!isRead ? 'bg-primary/5' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!isRead && (
                            <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                          <span className="font-medium text-sm truncate">
                            {notification.title}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: getLocale(),
                          })}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-br from-primary/90 to-primary p-6 relative">
            
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <DialogTitle className="text-lg font-semibold text-white pr-8 leading-tight">
                  {selectedNotification?.title}
                </DialogTitle>
                <p className="text-xs text-white/70 mt-1">
                  {selectedNotification && formatDistanceToNow(new Date(selectedNotification.created_at), {
                    addSuffix: true,
                    locale: getLocale(),
                  })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="p-6 space-y-4 bg-background">
            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {selectedNotification?.message}
            </p>
            
            {selectedNotification?.link && (
              <Button
                className="w-full gap-2 bg-primary hover:bg-primary/90"
                onClick={() => window.open(selectedNotification.link!, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                {t('header.notifications.open_link')}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationDropdown;
