import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Player = () => {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const videoUrl = searchParams.get("v");

  // Extrai o ID do vídeo do YouTube da URL
  const getYouTubeVideoId = (url: string | null) => {
    if (!url) return null;
    
    // Suporta vários formatos de URL do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // ID direto
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      {videoId ? (
        <div className="w-full max-w-5xl aspect-video relative">
          <iframe
            className="w-full h-full rounded-lg shadow-elegant"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&disablekb=0&playsinline=1`}
            title="YouTube video player"
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
          {/* Overlay to block title/channel info in top-left */}
          <div 
            className="absolute top-0 left-0 right-0 h-16 pointer-events-auto z-10"
            style={{ background: 'transparent' }}
            onClick={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
          />
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-app-text">{t("player.no.video")}</h1>
          <p className="text-app-muted">
            {t("player.param.help")}
          </p>
          <p className="text-sm text-app-muted">
            {t("player.example")}
          </p>
        </div>
      )}
    </div>
  );
};

export default Player;
