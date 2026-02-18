import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface VideoPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title: string;
}

const VideoPlayerDialog = ({ open, onOpenChange, videoUrl, title }: VideoPlayerDialogProps) => {
  // Extrai o ID do vídeo do YouTube da URL
  const getYouTubeVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // ID direto
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return url; // Se não encontrar padrão, assume que já é o ID
  };

  const videoId = getYouTubeVideoId(videoUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-[80vw] lg:w-[900px] p-0 bg-app-bg border-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="w-full aspect-video relative">
          <iframe
            className="w-full h-full rounded-xl"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&disablekb=0&playsinline=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          {/* Overlay to block YouTube logo in bottom-right corner */}
          <div 
            className="absolute bottom-3 right-12 w-16 h-8 pointer-events-auto z-10"
            style={{ background: 'transparent' }}
            onClick={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
          />
          {/* Overlay to block title/channel info in top-left (leaves space for close button) */}
          <div 
            className="absolute top-0 left-0 right-12 h-16 pointer-events-auto z-10"
            style={{ background: 'transparent' }}
            onClick={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;
