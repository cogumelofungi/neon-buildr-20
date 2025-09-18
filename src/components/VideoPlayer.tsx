import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, AlertCircle } from 'lucide-react';


interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  onProgress?: (progress: number) => void;
}

export function VideoPlayer({ isOpen, onClose, videoUrl, title, onProgress }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extract Google Drive file ID from URL
  const getGoogleDriveId = (url: string) => {
    const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Check if URL is YouTube
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Check if URL is Google Drive
  const isGoogleDriveUrl = (url: string) => {
    return url.includes('drive.google.com');
  };

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const youtubeId = isYouTubeUrl(videoUrl) ? getYouTubeId(videoUrl) : null;
  const googleDriveId = isGoogleDriveUrl(videoUrl) ? getGoogleDriveId(videoUrl) : null;

  // Refs e timers para carregamento do Google Drive
  const driveLoadStartRef = useRef<number | null>(null);
  const fallbackErrorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(true);
      setShowErrorDialog(false);

      if (googleDriveId) {
        driveLoadStartRef.current = Date.now();
        // Se depois de 8s ainda não deu sinal de carregamento satisfatório, mostra aviso
        if (fallbackErrorTimerRef.current) {
          clearTimeout(fallbackErrorTimerRef.current as any);
        }
        fallbackErrorTimerRef.current = window.setTimeout(() => {
          setShowErrorDialog(true);
        }, 8000);
      }
    }
    return () => {
      if (fallbackErrorTimerRef.current) {
        clearTimeout(fallbackErrorTimerRef.current as any);
        fallbackErrorTimerRef.current = null;
      }
    };
  }, [isOpen, videoUrl, googleDriveId]);

  const handleDriveIframeLoad = () => {
    // Quanto mais rápido carregar, maior a chance de ser a tela de erro do Drive
    const start = driveLoadStartRef.current ?? Date.now();
    const elapsed = Date.now() - start;

    setIsLoading(false);

    if (fallbackErrorTimerRef.current) {
      clearTimeout(fallbackErrorTimerRef.current as any);
      fallbackErrorTimerRef.current = null;
    }

    if (elapsed < 1200) {
      // Heurística: carregou quase instantâneo => provavelmente tela de erro do Drive
      setShowErrorDialog(true);
    }
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    onClose();
    // Voltar para a tela inicial
    window.location.href = '/';
  };

  const renderPlayer = () => {
    if (youtubeId) {
      // YouTube embed with minimal controls
      return (
        <div className="relative w-full h-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=0&showinfo=0&fs=1&iv_load_policy=3&disablekb=1`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      );
    }

    if (googleDriveId) {
      // Google Drive embed com loading e heurística de erro
      return (
        <div className="relative w-full h-full bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="text-white text-sm">Carregando vídeo...</p>
              </div>
            </div>
          )}
          <iframe
            src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
            title={title}
            className="w-full h-full"
            onLoad={handleDriveIframeLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      );
    }

    // For other video URLs (direct video files) - with loading events
    return (
      <div className="relative w-full h-full bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-white text-sm">Carregando vídeo...</p>
            </div>
          </div>
        )}
        <video
          src={videoUrl}
          className="w-full h-full object-contain"
          autoPlay
          loop
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onTimeUpdate={(e) => {
            const video = e.target as HTMLVideoElement;
            setCurrentTime(video.currentTime);
            if (onProgress && video.duration) {
              onProgress((video.currentTime / video.duration) * 100);
            }
          }}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            setDuration(video.duration);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={(e) => {
            const video = e.target as HTMLVideoElement;
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
          }}
        >
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full w-screen h-screen p-0 m-0 bg-black border-0">
          {/* Close button - positioned absolutely */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 border border-white/30"
          >
            <X className="w-4 h-4" />
          </Button>
          
          {/* Full screen video */}
          <div className="w-full h-full">
            {renderPlayer()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog for Google Drive Issues */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Episódio com problema
            </AlertDialogTitle>
            <AlertDialogDescription>
              Este episódio está temporariamente indisponível devido a uma limitação do Google Drive. 
              Nossa equipe já está trabalhando para resolver este problema o mais rápido possível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDialogClose}>
              Voltar à tela inicial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}