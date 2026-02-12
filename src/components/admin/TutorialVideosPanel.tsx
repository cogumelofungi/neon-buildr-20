import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, Video } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VideoPlayerDialog from "../VideoPlayerDialog";

interface TutorialVideo {
  id: string;
  title: string;
  title_en?: string;
  title_es?: string;
  description?: string;
  description_en?: string;
  description_es?: string;
  video_url: string;
  video_url_en?: string;
  video_url_es?: string;
  category: string;
  section?: string;
  section_en?: string;
  section_es?: string;
  slug: string;
  is_active: boolean;
}

const TutorialVideosPanel = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [videos, setVideos] = useState<TutorialVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TutorialVideo | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    title_es: '',
    description: '',
    description_en: '',
    description_es: '',
    video_url: '',
    video_url_en: '',
    video_url_es: '',
    category: '',
    section: '',
    section_en: '',
    section_es: '',
    slug: '',
    is_active: true
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('tutorial_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast({
        title: t("videos.error.load"),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingVideo) {
        const { error } = await supabase
          .from('tutorial_videos')
          .update(formData)
          .eq('id', editingVideo.id);

        if (error) throw error;
        toast({ title: t("videos.success.update") });
      } else {
        const { error } = await supabase
          .from('tutorial_videos')
          .insert([formData]);

        if (error) throw error;
        toast({ title: t("videos.success.create") });
      }

      setShowDialog(false);
      resetForm();
      fetchVideos();
    } catch (error: any) {
      toast({
        title: t("videos.error.save"),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("videos.confirm.delete"))) return;

    try {
      const { error } = await supabase
        .from('tutorial_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: t("videos.success.delete") });
      fetchVideos();
    } catch (error: any) {
      toast({
        title: t("videos.error.delete"),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_en: '',
      title_es: '',
      description: '',
      description_en: '',
      description_es: '',
      video_url: '',
      video_url_en: '',
      video_url_es: '',
      category: '',
      section: '',
      section_en: '',
      section_es: '',
      slug: '',
      is_active: true
    });
    setEditingVideo(null);
  };

  const openEditDialog = (video: TutorialVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      title_en: video.title_en || '',
      title_es: video.title_es || '',
      description: video.description || '',
      description_en: video.description_en || '',
      description_es: video.description_es || '',
      video_url: video.video_url,
      video_url_en: video.video_url_en || '',
      video_url_es: video.video_url_es || '',
      category: video.category,
      section: video.section || '',
      section_en: video.section_en || '',
      section_es: video.section_es || '',
      slug: video.slug,
      is_active: video.is_active
    });
    setShowDialog(true);
  };

  return (
    <>
      <Card className="bg-app-surface border-app-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-app-text">{t("videos.title")}</CardTitle>
              <CardDescription className="text-app-muted">
                {t("videos.subtitle")}
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowDialog(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("videos.button.new")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("videos.table.title")}</TableHead>
                <TableHead>{t("videos.table.category")}</TableHead>
                <TableHead>Seção</TableHead>
                <TableHead>{t("videos.table.slug")}</TableHead>
                <TableHead>{t("videos.table.status")}</TableHead>
                <TableHead className="text-right">{t("videos.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>{video.category}</TableCell>
                  <TableCell className="text-muted-foreground">{video.section || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{video.slug}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${video.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {video.is_active ? t("videos.status.active") : t("videos.status.inactive")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewVideo({ url: video.video_url, title: video.title })}
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(video)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(video.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-app-surface border-app-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-app-text">
              {editingVideo ? t("videos.dialog.edit") : t("videos.dialog.new")}
            </DialogTitle>
            <DialogDescription className="text-app-muted">
              {t("videos.dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title">{t("videos.form.title")} (PT)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="title_en">Título (EN)</Label>
                <Input
                  id="title_en"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="(opcional)"
                />
              </div>
              <div>
                <Label htmlFor="title_es">Título (ES)</Label>
                <Input
                  id="title_es"
                  value={formData.title_es}
                  onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                  placeholder="(opcional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="description">{t("videos.form.description")} (PT)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description_en">Descrição (EN)</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="(opcional)"
                />
              </div>
              <div>
                <Label htmlFor="description_es">Descrição (ES)</Label>
                <Textarea
                  id="description_es"
                  value={formData.description_es}
                  onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                  placeholder="(opcional)"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="video_url">{t("videos.form.url")}</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder={t("videos.form.url.placeholder")}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="video_url_en">URL do Vídeo (English)</Label>
              <Input
                id="video_url_en"
                value={formData.video_url_en}
                onChange={(e) => setFormData({ ...formData, video_url_en: e.target.value })}
                placeholder="https://youtube.com/watch?v=... (opcional)"
              />
            </div>
            
            <div>
              <Label htmlFor="video_url_es">URL do Vídeo (Español)</Label>
              <Input
                id="video_url_es"
                value={formData.video_url_es}
                onChange={(e) => setFormData({ ...formData, video_url_es: e.target.value })}
                placeholder="https://youtube.com/watch?v=... (opcional)"
              />
            </div>
            
            <div>
              <Label htmlFor="category">{t("videos.form.category")}</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="ex: hotmart, kiwify, eduzz"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Usado para exibir tutorial no sidebar de integrações
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="section">Seção na Academy (PT)</Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="ex: Integrações com Plataformas"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Agrupa vídeos na rota /academy. Se vazio, usa a categoria.
                </p>
              </div>
              <div>
                <Label htmlFor="section_en">Seção (EN)</Label>
                <Input
                  id="section_en"
                  value={formData.section_en}
                  onChange={(e) => setFormData({ ...formData, section_en: e.target.value })}
                  placeholder="ex: Platform Integrations"
                />
              </div>
              <div>
                <Label htmlFor="section_es">Seção (ES)</Label>
                <Input
                  id="section_es"
                  value={formData.section_es}
                  onChange={(e) => setFormData({ ...formData, section_es: e.target.value })}
                  placeholder="ex: Integraciones de Plataforma"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="slug">{t("videos.form.slug")}</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder={t("videos.form.slug.placeholder")}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">{t("videos.form.active")}</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                {t("videos.button.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("videos.button.saving") : t("videos.button.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {previewVideo && (
        <VideoPlayerDialog
          open={!!previewVideo}
          onOpenChange={(open) => !open && setPreviewVideo(null)}
          videoUrl={previewVideo.url}
          title={previewVideo.title}
        />
      )}
    </>
  );
};

export default TutorialVideosPanel;
