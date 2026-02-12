import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Bell, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const NotificationsPanel = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    link: '',
    is_active: true,
  });

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []) as unknown as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(t('admin.notifications.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      link: '',
      is_active: true,
    });
    setEditingNotification(null);
  };

  const handleOpenDialog = (notification?: Notification) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        link: notification.link || '',
        is_active: notification.is_active,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error(t('admin.notifications.validation_error'));
      return;
    }

    try {
      if (editingNotification) {
        const { error } = await supabase
          .from('notifications' as any)
          .update({
            title: formData.title,
            message: formData.message,
            link: formData.link || null,
            is_active: formData.is_active,
          } as any)
          .eq('id', editingNotification.id);

        if (error) throw error;
        toast.success(t('admin.notifications.update_success'));
      } else {
        const { error } = await supabase
          .from('notifications' as any)
          .insert({
            title: formData.title,
            message: formData.message,
            link: formData.link || null,
            is_active: formData.is_active,
          } as any);

        if (error) throw error;
        toast.success(t('admin.notifications.create_success'));
      }

      setDialogOpen(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      toast.error(t('admin.notifications.save_error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.notifications.delete_confirm'))) return;

    try {
      const { error } = await supabase
        .from('notifications' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(t('admin.notifications.delete_success'));
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(t('admin.notifications.delete_error'));
    }
  };

  const toggleActive = async (notification: Notification) => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ is_active: !notification.is_active } as any)
        .eq('id', notification.id);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error toggling notification:', error);
      toast.error(t('admin.notifications.toggle_error'));
    }
  };

  return (
    <Card className="bg-app-surface border-app-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('admin.notifications.title')}
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.notifications.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingNotification 
                  ? t('admin.notifications.edit') 
                  : t('admin.notifications.add')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('admin.notifications.form.title')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('admin.notifications.form.title_placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('admin.notifications.form.message')}</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('admin.notifications.form.message_placeholder')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  {t('admin.notifications.form.link')}
                </Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  type="url"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">{t('admin.notifications.form.active')}</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('admin.notifications.form.cancel')}
                </Button>
                <Button onClick={handleSubmit}>
                  {t('admin.notifications.form.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('admin.notifications.loading')}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('admin.notifications.empty')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.notifications.table.title')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('admin.notifications.table.message')}</TableHead>
                <TableHead>{t('admin.notifications.table.status')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('admin.notifications.table.date')}</TableHead>
                <TableHead className="text-right">{t('admin.notifications.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {notification.title}
                      {notification.link && (
                        <LinkIcon className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {notification.message}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={notification.is_active ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleActive(notification)}
                    >
                      {notification.is_active 
                        ? t('admin.notifications.status.active') 
                        : t('admin.notifications.status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {format(new Date(notification.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(notification)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
