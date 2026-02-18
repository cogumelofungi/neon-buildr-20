import { useState, useEffect, useCallback, useRef } from "react";

// Desktop images
import depMb1 from "@/assets/depoimentos/dep-mb-1.png";
import depMb2 from "@/assets/depoimentos/dep-mb-2.png";
import depMb3 from "@/assets/depoimentos/dep-mb-3.png";
import depMb4 from "@/assets/depoimentos/dep-mb-4.png";
import depMb5 from "@/assets/depoimentos/dep-mb-5.png";
import depMb6 from "@/assets/depoimentos/dep-mb-6.png";
import depMb7 from "@/assets/depoimentos/dep-mb-7.png";

// Mobile images
import depMb1Mobile from "@/assets/depoimentos/dep-mb-1-mobile.png";
import depMb2Mobile from "@/assets/depoimentos/dep-mb-2-mobile.png";
import depMb3Mobile from "@/assets/depoimentos/dep-mb-3-mobile.png";
import depMb4Mobile from "@/assets/depoimentos/dep-mb-4-mobile.png";
import depMb5Mobile from "@/assets/depoimentos/dep-mb-5-mobile.png";
import depMb6Mobile from "@/assets/depoimentos/dep-mb-6-mobile.png";
import depMb7Mobile from "@/assets/depoimentos/dep-mb-7-mobile.png";

const testimonials = [
  { id: 1, image: depMb1, imageMobile: depMb1Mobile },
  { id: 2, image: depMb2, imageMobile: depMb2Mobile },
  { id: 3, image: depMb3, imageMobile: depMb3Mobile },
  { id: 4, image: depMb4, imageMobile: depMb4Mobile },
  { id: 5, image: depMb5, imageMobile: depMb5Mobile },
  { id: 6, image: depMb6, imageMobile: depMb6Mobile },
  { id: 7, image: depMb7, imageMobile: depMb7Mobile },
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cardWidth = 420; // Base card width for calculations
  const gap = 50; // Gap between cards

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  useEffect(() => {
    if (!isAutoPlaying || isDragging) return;
    
    const interval = setInterval(goToNext, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isDragging, goToNext]);

  // Get indices for visible slides (we show only 3)
  const getVisibleIndices = () => {
    const total = testimonials.length;
    return [
      (currentIndex - 1 + total) % total,
      currentIndex,
      (currentIndex + 1) % total,
    ];
  };

  const visibleIndices = getVisibleIndices();

  // Touch/Mouse handlers for drag functionality
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setIsAutoPlaying(false);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const threshold = 80;
    if (dragOffset > threshold) {
      goToPrev();
    } else if (dragOffset < -threshold) {
      goToNext();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Calculate position and style for each card based on its relative position
  const getCardStyle = (relativePosition: number) => {
    // relativePosition: -2, -1, 0, 1, 2 (0 is center)
    const baseOffset = relativePosition * (cardWidth + gap);
    const totalOffset = baseOffset + dragOffset;
    
    // Calculate scale and opacity based on distance from center
    const distanceFromCenter = Math.abs(relativePosition + dragOffset / (cardWidth + gap));
    const scale = Math.max(0.7, 1 - distanceFromCenter * 0.15);
    const opacity = Math.max(0.4, 1 - distanceFromCenter * 0.3);
    
    // Rotation based on position (cards on sides are tilted)
    const rotation = relativePosition === 0 
      ? (dragOffset / (cardWidth + gap)) * -15
      : relativePosition * -20 + (dragOffset / (cardWidth + gap)) * -5;

    return {
      transform: `translateX(${totalOffset}px) perspective(1200px) rotateY(${rotation}deg) scale(${scale})`,
      opacity,
      zIndex: 10 - Math.abs(relativePosition),
    };
  };

  return (
    <div
      className="relative w-full py-0 overflow-hidden select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => !isDragging && setIsAutoPlaying(true)}
    >
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative mx-auto flex items-center justify-center px-4 cursor-grab active:cursor-grabbing h-[420px] sm:h-[210px] md:h-[260px]"
        style={{ maxWidth: "1600px" }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Slides - Only 3 cards visible */}
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Mobile: Fade transition with all testimonials stacked */}
          <div className="sm:hidden absolute inset-0 flex flex-col items-center justify-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out"
                style={{
                  opacity: index === currentIndex ? 1 : 0,
                  pointerEvents: index === currentIndex ? 'auto' : 'none',
                }}
              >
                <img
                  src={testimonial.imageMobile}
                  alt={`Depoimento ${testimonial.id}`}
                  className="w-full max-w-[320px] rounded-2xl pointer-events-none"
                  draggable={false}
                />
                {/* Dots for mobile - below image */}
                <div className="flex justify-center gap-2.5 mt-4">
                  {testimonials.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      onClick={() => {
                        if (!isTransitioning) {
                          setIsTransitioning(true);
                          setCurrentIndex(dotIndex);
                          setTimeout(() => setIsTransitioning(false), 500);
                        }
                      }}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        dotIndex === currentIndex
                          ? "bg-primary w-8"
                          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 w-3"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: Original 3D carousel */}
          {visibleIndices.map((testimonialIndex, i) => {
            const relativePosition = i - 1; // -1, 0, 1 (0 is center)
            const style = getCardStyle(relativePosition);

            // Side cards (hidden on mobile and tablet - only show on desktop md+)
            if (Math.abs(relativePosition) === 1) {
              return (
                <div
                  key={`${testimonialIndex}-${i}`}
                  className="absolute hidden md:block transition-all duration-300 ease-out"
                  style={{
                    ...style,
                    transitionProperty: isDragging ? "none" : "transform, opacity",
                  }}
                >
                  <img
                    src={testimonials[testimonialIndex].image}
                    alt={`Depoimento ${testimonials[testimonialIndex].id}`}
                    className="w-[380px] lg:w-[450px] xl:w-[500px] rounded-2xl pointer-events-none"
                    draggable={false}
                  />
                </div>
              );
            }

            // Center card - only for tablet/desktop
            return (
              <div
                key={`${testimonialIndex}-${i}`}
                className="hidden sm:flex flex-col items-center sm:absolute transition-all duration-300 ease-out"
                style={{
                  ...style,
                  transitionProperty: isDragging ? "none" : "transform, opacity",
                }}
              >
                {/* Tablet/Desktop image - for screens >= 640px (sm and above) */}
                <img
                  src={testimonials[testimonialIndex].image}
                  alt={`Depoimento ${testimonials[testimonialIndex].id}`}
                  className="sm:w-[520px] md:w-[480px] lg:w-[550px] xl:w-[600px] rounded-2xl pointer-events-none"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots Indicator - hidden on mobile, shown on tablet/desktop */}
      <div className="hidden sm:flex justify-center gap-2.5 mt-0.5">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentIndex(index);
                setTimeout(() => setIsTransitioning(false), 500);
              }
            }}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-primary w-8"
                : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 w-3"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
