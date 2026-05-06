'use client';
import { useEffect, useRef } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface TryOn3DProps {
  modelUrl: string;
  productName: string;
}

export default function TryOn3D({ modelUrl, productName }: TryOn3DProps) {
  const viewerRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-dark-700 to-dark-800 rounded-xl overflow-hidden">
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        alt={`3D model of ${productName}`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        auto-rotate-delay="1000"
        rotation-per-second="30deg"
        shadow-intensity="1"
        shadow-softness="0.5"
        exposure="1"
        environment-image="neutral"
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        {/* AR button */}
        <button
          slot="ar-button"
          className="absolute bottom-4 right-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          View in AR
        </button>

        {/* Progress bar */}
        <div slot="progress-bar" className="absolute inset-x-0 top-0 h-1">
          <div className="h-full bg-brand-500 transition-all" />
        </div>
      </model-viewer>

      {/* Controls hint */}
      <div className="absolute top-4 left-4 bg-dark-900/70 backdrop-blur-sm text-white/60 text-xs px-3 py-2 rounded-lg space-y-1">
        <p className="flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
          Drag to rotate
        </p>
        <p className="flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Pinch to zoom
        </p>
      </div>
    </div>
  );
}
