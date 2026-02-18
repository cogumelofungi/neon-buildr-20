import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Volume2, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AudioPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioUrl: string;
  title: string;
  allowDownload?: boolean;
  onDownload?: (url: string, filename: string) => void;
}

const AudioPlayerDialog = ({
  open,
  onOpenChange,
  audioUrl,
  title,
  allowDownload = false,
  onDownload,
}: AudioPlayerDialogProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const syncDuration = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const d = audio.duration;
    if (Number.isFinite(d) && d > 0) {
      setDuration(d);
      setIsReady(true);
    }
  };

  // When the dialog opens (or URL changes), reload metadata and try to autoplay.
  useEffect(() => {
    if (!open) return;
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsReady(false);

    audio.load();

    // Try autoplay (may be blocked)
    audio.play().catch(() => {
      // Autoplay might be blocked; user will press play
    });
  }, [open, audioUrl]);

  // Ensure we always stop audio when closing (overlay click / esc / close button)
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsReady(false);
    }

    onOpenChange(nextOpen);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  const handleDownloadClick = () => {
    if (onDownload) {
      const filename = title ? `${title}.mp3` : "audio.mp3";
      onDownload(audioUrl, filename);
    }
  };

  const max = Math.max(duration || 0, 1);
  const safeCurrent = Math.min(currentTime, max);
  const percent = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideClose
        className="max-w-md w-[95vw] p-0 bg-gray-900 border-gray-700 overflow-hidden rounded-2xl"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10 text-white hover:bg-white/20 rounded-full"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="p-6 pt-10">
          {/* Audio Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <Volume2 className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-white text-lg font-semibold text-center mb-6 px-4 break-words">
            {title || "Áudio"}
          </h3>

          {/* Audio Element */}
          <audio
            key={audioUrl}
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            className="sr-only"
            onLoadedMetadata={syncDuration}
            onDurationChange={syncDuration}
            onCanPlay={syncDuration}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
          />

          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={max}
              value={safeCurrent}
              onChange={handleSeek}
              disabled={!isReady}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) ${percent}%, hsl(var(--muted)) ${percent}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={togglePlayPause}
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white"
            >
            {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </Button>

            {allowDownload && onDownload && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={handleDownloadClick}
              >
                <Download className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioPlayerDialog;
