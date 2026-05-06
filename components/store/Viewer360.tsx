'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

interface Viewer360Props {
  images: string[];
}

export default function Viewer360({ images }: Viewer360Props) {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const startXRef = useRef(0);
  const lastIndexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const updateIndex = useCallback(
    (delta: number) => {
      const newIndex = ((lastIndexRef.current + delta) % images.length + images.length) % images.length;
      lastIndexRef.current = newIndex;
      setIndex(newIndex);
    },
    [images.length]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    lastIndexRef.current = index;
    stopAutoPlay();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = Math.round((e.clientX - startXRef.current) / 6);
      const newIndex = ((lastIndexRef.current + delta) % images.length + images.length) % images.length;
      setIndex(newIndex);
    },
    [isDragging, images.length]
  );

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    lastIndexRef.current = index;
    stopAutoPlay();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = Math.round((e.touches[0].clientX - startXRef.current) / 6);
    const newIndex = ((lastIndexRef.current + delta) % images.length + images.length) % images.length;
    setIndex(newIndex);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setIsAutoPlaying(false);
  };

  const startAutoPlay = () => {
    setIsAutoPlaying(true);
    autoPlayRef.current = setInterval(() => {
      lastIndexRef.current = (lastIndexRef.current + 1) % images.length;
      setIndex(lastIndexRef.current);
    }, 80);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        No 360° images available
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none">
      <div
        ref={containerRef}
        className={`w-full h-full viewer-360-container ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <img
          src={images[index]}
          alt={`360 view - frame ${index + 1}`}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
        <button
          onClick={isAutoPlaying ? stopAutoPlay : startAutoPlay}
          className="flex items-center gap-2 bg-dark-900/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full border border-white/10 hover:border-brand-500 transition-all"
        >
          {isAutoPlaying ? (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Auto Rotate
            </>
          )}
        </button>
      </div>

      {/* Drag hint */}
      <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
        <span className="bg-dark-900/60 text-white/50 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
          Drag to rotate
        </span>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <div className="flex gap-0.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 transition-all duration-100 rounded-full ${
                i === index ? 'w-4 bg-brand-500' : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
