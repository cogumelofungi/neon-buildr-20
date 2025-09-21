import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  X, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, 
  Settings, Maximize, Type, Gauge, AlertCircle 
} from 'lucide-react';
import { VideoLoader } from './VideoLoader';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface AdvancedVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  onProgress?: (progress: number) => void;
  subtitles?: Array<{ label: string; src: string; }>;
}

export function AdvancedVideoPlayer({ 
  isOpen, 
  onClose, 
  videoUrl, 
  title, 
  onProgress,
  subtitles = []
}: AdvancedVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Refs e timers para carregamento do Google Drive
  const driveLoadStartRef = useRef<number | null>(null);
  const fallbackErrorTimerRef = useRef<number | null>(null);

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

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Check if URL is Google Drive
  const isGoogleDriveUrl = (url: string) => {
    return url.includes('drive.google.com');
  };

  // Check if URL is Archive.org
  const isArchiveOrgUrl = (url: string) => {
    return url.includes('archive.org');
  };

  const youtubeId = isYouTubeUrl(videoUrl) ? getYouTubeId(videoUrl) : null;
  const googleDriveId = isGoogleDriveUrl(videoUrl) ? getGoogleDriveId(videoUrl) : null;
  const isArchive = isArchiveOrgUrl(videoUrl);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = vol / 100;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  };

  const handleSeek = (newTime: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const enterFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(true);
      setShowErrorDialog(false);
      showControlsTemporarily();

      if (googleDriveId) {
        console.log('Google Drive video detected:', googleDriveId);
        driveLoadStartRef.current = Date.now();
        // Se depois de 8s ainda não deu sinal de carregamento satisfatório, mostra aviso (apenas para Google Drive)
        if (fallbackErrorTimerRef.current) {
          clearTimeout(fallbackErrorTimerRef.current as any);
        }
        fallbackErrorTimerRef.current = window.setTimeout(() => {
          console.log('Google Drive timeout - showing error dialog');
          setShowErrorDialog(true);
        }, 8000);
      } else if (isArchive) {
        console.log('Archive.org video detected');
        // Para archive.org, apenas inicia o loading sem heurística de erro
        driveLoadStartRef.current = Date.now();
      } else if (youtubeId) {
        console.log('YouTube video detected:', youtubeId);
        // Para YouTube, remove o loading imediatamente já que não temos controle sobre o iframe
        setIsLoading(false);
      } else {
        console.log('Direct video URL detected');
        // Para vídeos diretos, o loading será controlado pelos eventos do video
      }
    }
    return () => {
      if (fallbackErrorTimerRef.current) {
        clearTimeout(fallbackErrorTimerRef.current as any);
        fallbackErrorTimerRef.current = null;
      }
    };
  }, [isOpen, videoUrl, googleDriveId, isArchive, youtubeId]);

  const handleDriveIframeLoad = () => {
    // Quanto mais rápido carregar, maior a chance de ser a tela de erro do Drive
    const start = driveLoadStartRef.current ?? Date.now();
    const elapsed = Date.now() - start;

    console.log('Iframe loaded, elapsed time:', elapsed, 'ms');
    setIsLoading(false);

    if (fallbackErrorTimerRef.current) {
      clearTimeout(fallbackErrorTimerRef.current as any);
      fallbackErrorTimerRef.current = null;
    }

    // Aplica heurística de erro apenas para Google Drive, não para archive.org
    if (elapsed < 1200 && googleDriveId && !isArchive) {
      console.log('Fast load detected for Google Drive - showing error dialog');
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

  if (youtubeId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full w-screen h-screen p-0 m-0 bg-black border-0">
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&iv_load_policy=3`}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (googleDriveId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full w-screen h-screen p-0 m-0 bg-black border-0 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:z-50">
          <div className="relative w-full h-full">
            {isLoading && <VideoLoader title={title} />}
            <iframe
              src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
              title={title}
              className="w-full h-full"
              onLoad={handleDriveIframeLoad}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isArchive) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full w-screen h-screen p-0 m-0 bg-black border-0 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:z-50">
          <div className="relative w-full h-full">
            {isLoading && <VideoLoader title={title} />}
            <iframe
              src={videoUrl}
              title={title}
              className="w-full h-full"
              onLoad={handleDriveIframeLoad}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              style={{
                border: 'none',
                zoom: 1,
                transform: 'scale(1)',
                objectFit: 'contain'
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-full w-screen h-screen p-0 m-0 bg-black border-0"
          onPointerMove={showControlsTemporarily}
        >
          <div className="relative w-full h-full">
            {isLoading && <VideoLoader title={title} />}
            
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              autoPlay
              onLoadStart={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
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
                video.volume = volume[0] / 100;
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={showControlsTemporarily}
            >
              {subtitles.map((subtitle, index) => (
                <track
                  key={index}
                  kind="subtitles"
                  src={subtitle.src}
                  label={subtitle.label}
                  srcLang={subtitle.label.toLowerCase()}
                  default={index === 0}
                />
              ))}
            </video>

            {/* Video Controls */}
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
                <h1 className="text-xl font-semibold text-white max-w-2xl truncate">
                  {title}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Center Play Button */}
              {!isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="w-20 h-20 text-white hover:bg-white/20 rounded-full"
                  >
                    <Play className="w-10 h-10" />
                  </Button>
                </div>
              )}

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                {/* Progress Bar */}
                {duration > 0 && (
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                )}

                {/* Control Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>

                    {/* Skip buttons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => skip(-10)}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => skip(10)}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted || volume[0] === 0 ? 
                          <VolumeX className="w-5 h-5" /> : 
                          <Volume2 className="w-5 h-5" />
                        }
                      </Button>
                      <div className="w-20">
                        <Slider
                          value={volume}
                          max={100}
                          step={1}
                          onValueChange={handleVolumeChange}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Time Display */}
                    <span className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Playback Speed */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                        >
                          <Gauge className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                          <DropdownMenuItem
                            key={speed}
                            onClick={() => changePlaybackSpeed(speed)}
                            className={playbackSpeed === speed ? 'bg-accent' : ''}
                          >
                            {speed}x
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Subtitles */}
                    {subtitles.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                          >
                            <Type className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setSelectedSubtitle(null)}>
                            Desligado
                          </DropdownMenuItem>
                          {subtitles.map((subtitle, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => setSelectedSubtitle(subtitle.src)}
                              className={selectedSubtitle === subtitle.src ? 'bg-accent' : ''}
                            >
                              {subtitle.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {/* Fullscreen */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={enterFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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