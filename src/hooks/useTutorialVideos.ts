import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from './useLanguage';

export interface TutorialVideo {
  id: string;
  title: string;
  title_en?: string | null;
  title_es?: string | null;
  description?: string;
  description_en?: string | null;
  description_es?: string | null;
  video_url: string;
  video_url_en?: string | null;
  video_url_es?: string | null;
  category: string;
  section?: string;
  section_en?: string | null;
  section_es?: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTutorialVideos = () => {
  const [videos, setVideos] = useState<TutorialVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tutorial_videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Used by integrations sidebar - finds video by category (platform name)
  const getVideoByCategory = (category: string) => {
    return videos.find(v => v.category.toLowerCase() === category.toLowerCase());
  };

  // Used by /academy - groups videos by section field
  const getVideosBySection = () => {
    const sections: Record<string, TutorialVideo[]> = {};
    videos.forEach(video => {
      const sectionName = video.section || video.category;
      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      sections[sectionName].push(video);
    });
    return sections;
  };

  // Get unique sections for filtering
  const getSections = () => {
    const sectionsSet = new Set<string>();
    videos.forEach(video => {
      sectionsSet.add(video.section || video.category);
    });
    return Array.from(sectionsSet);
  };

  // Get video URL based on current language with fallback to Portuguese
  const getVideoUrl = (video: TutorialVideo): string => {
    if (language === 'en' && video.video_url_en) {
      return video.video_url_en;
    }
    if (language === 'es' && video.video_url_es) {
      return video.video_url_es;
    }
    return video.video_url;
  };

  // Get video title based on current language with fallback to Portuguese
  const getVideoTitle = (video: TutorialVideo): string => {
    if (language === 'en' && video.title_en) {
      return video.title_en;
    }
    if (language === 'es' && video.title_es) {
      return video.title_es;
    }
    return video.title;
  };

  // Get video description based on current language with fallback to Portuguese
  const getVideoDescription = (video: TutorialVideo): string | undefined => {
    if (language === 'en' && video.description_en) {
      return video.description_en;
    }
    if (language === 'es' && video.description_es) {
      return video.description_es;
    }
    return video.description;
  };

  // Get video section based on current language with fallback to Portuguese
  const getVideoSection = (video: TutorialVideo): string => {
    const section = video.section || video.category;
    if (language === 'en') {
      return video.section_en || section;
    }
    if (language === 'es') {
      return video.section_es || section;
    }
    return section;
  };

  return { 
    videos, 
    isLoading, 
    fetchVideos, 
    getVideoByCategory, 
    getVideosBySection, 
    getSections,
    getVideoUrl,
    getVideoTitle,
    getVideoDescription,
    getVideoSection
  };
};
