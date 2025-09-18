import { Play, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Season, Episode } from "@/data/programs";

interface EpisodesCarouselProps {
  season: Season;
  seriesTitle: string;
  onPlayEpisode: (episode: Episode) => void;
}

export function EpisodesCarousel({ 
  season, 
  seriesTitle, 
  onPlayEpisode 
}: EpisodesCarouselProps) {
  const handleEpisodeClick = (episode: Episode) => {
    if (episode.videoUrl || episode.link) {
      onPlayEpisode(episode);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Duração não informada";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  if (!season.episodes || season.episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum episódio disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{seriesTitle}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-primary text-white">
              Temporada {season.seasonNumber}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {season.episodes.length} episódios
            </span>
          </div>
        </div>
      </div>

      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {season.episodes.map((episode, index) => (
            <CarouselItem key={episode.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Card 
                className="h-full cursor-pointer group hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => handleEpisodeClick(episode)}
              >
                <CardContent className="p-4 h-full flex flex-col">
                  {/* Episode Number Badge */}
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs font-bold">
                      EP {index + 1}
                    </Badge>
                  </div>

                  {/* Episode Image Placeholder */}
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Play className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {episode.title}
                    </h4>
                    
                    {episode.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {episode.description}
                      </p>
                    )}

                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {episode.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(episode.duration)}</span>
                        </div>
                      )}
                      {episode.airDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(episode.airDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="mt-3">
                    <Button
                      variant={episode.videoUrl || episode.link ? "default" : "secondary"}
                      size="sm"
                      className="w-full text-xs group-hover:scale-105 transition-transform"
                      disabled={!episode.videoUrl && !episode.link}
                    >
                      <Play className="w-3 h-3 mr-1 fill-current" />
                      {episode.videoUrl || episode.link ? "Assistir" : "Indisponível"}
                    </Button>
                  </div>

                  {episode.watched && (
                    <Badge variant="secondary" className="mt-2 text-xs self-start">
                      Assistido
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
}