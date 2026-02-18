import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useTutorialVideos, TutorialVideo } from '@/hooks/useTutorialVideos';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Play, Search, GraduationCap, Filter, X, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import Header from '@/components/Header';
import { useAuthContext } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Academy = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { videos, isLoading, getSections, getVideosBySection, getVideoUrl, getVideoTitle, getVideoDescription, getVideoSection } = useTutorialVideos();
  const { user, isLoading: authLoading } = useAuthContext();
  const { toast } = useToast();

  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Check if user is not logged in
  const isNotLoggedIn = !authLoading && !user;

  // Get unique sections
  const sections = getSections();

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const title = getVideoTitle(video);
    const description = getVideoDescription(video);
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const videoSection = getVideoSection(video);
    const matchesSection = !selectedSection || videoSection === selectedSection;
    return matchesSearch && matchesSection;
  });

  // Group videos by section (using translated section)
  const videosBySection = filteredVideos.reduce((acc, video) => {
    const sectionName = getVideoSection(video);
    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }
    acc[sectionName].push(video);
    return acc;
  }, {} as Record<string, TutorialVideo[]>);

  // Extract YouTube thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: t("auth.login.success"),
      });
    } catch (error: any) {
      toast({
        title: t("auth.error.title"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
  
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset-link', {
        body: { 
          email: resetEmail,
          redirectUrl: window.location.origin
        }
      });
  
      if (error) throw error;
  
      if (!data?.success) {
        throw new Error(data?.error || t("auth.send_code_error"));
      }
  
      toast({
        title: t("auth.reset_link_sent"),
        description: t("auth.reset_link_sent_desc"),
      });
  
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: t("auth.send_code_error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Show login dialog if not logged in
  if (isNotLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        
        <Dialog open={!showForgotPassword} onOpenChange={() => navigate('/app')}>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              {t("academy.restricted_access")}
            </DialogTitle>
            <DialogDescription>
              {t("academy.login_required")}
            </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.email.placeholder")}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.password.placeholder")}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-primary hover:underline p-0 h-auto"
                  onClick={() => setShowForgotPassword(true)}
                >
                  {t("auth.forgot_password")}
                </Button>
              </div>

              <Button type="submit" disabled={isLoginLoading} className="w-full">
                {isLoginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("auth.login.loading")}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    {t("auth.login.button")}
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("auth.recover_password")}</DialogTitle>
              <DialogDescription>
                {t("auth.recover_password_desc")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">{t("auth.email")}</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder={t("auth.email.placeholder")}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                  }}
                  className="flex-1"
                >
                  {t("editor.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoginLoading}
                  className="flex-1"
                >
                  {isLoginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("auth.sending")}
                    </>
                  ) : (
                    t("auth.send_link")
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-16">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("academy.title")}</h1>
            <p className="text-muted-foreground">{t("academy.subtitle")}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("academy.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? t("academy.no_videos") : t("academy.no_tutorials")}
            </h2>
            <p className="text-muted-foreground">
              {searchTerm ? t("academy.search_other") : t("academy.coming_soon")}
            </p>
          </div>
        )}

        {/* Videos by Section */}
        {!isLoading && Object.entries(videosBySection).map(([section, sectionVideos]) => (
          <section key={section} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                {section}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {sectionVideos.length} {sectionVideos.length === 1 ? t("academy.video") : t("academy.videos")}
              </span>
            </div>

            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="w-full relative"
            >
              <CarouselContent className="-ml-4">
                {sectionVideos.map((video) => {
                  const thumbnail = getYouTubeThumbnail(getVideoUrl(video));
                  
                  return (
                    <CarouselItem key={video.id} className="pl-4 basis-[280px] sm:basis-[300px] lg:basis-[320px]">
                      <Card 
                        className="group cursor-pointer overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                        onClick={() => setSelectedVideo(video)}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-muted overflow-hidden">
                          {thumbnail ? (
                            <img 
                              src={thumbnail} 
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                              <Play className="w-12 h-12 text-primary/50" />
                            </div>
                          )}
                          
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                              <Play className="w-6 h-6 text-primary-foreground ml-1" />
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {getVideoTitle(video)}
                          </h3>
                          {getVideoDescription(video) && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {getVideoDescription(video)}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex left-0 -translate-x-full -ml-2" />
              <CarouselNext className="hidden sm:flex right-0 translate-x-full -mr-2" />
            </Carousel>
          </section>
        ))}
      </main>

      {/* Video Player Dialog */}
      {selectedVideo && (
        <VideoPlayerDialog
          open={!!selectedVideo}
          onOpenChange={(open) => !open && setSelectedVideo(null)}
          videoUrl={getVideoUrl(selectedVideo)}
          title={getVideoTitle(selectedVideo)}
        />
      )}
    </div>
  );
};

export default Academy;
