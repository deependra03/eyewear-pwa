'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl mb-6">⚠️</p>
        <h1 className="font-display text-4xl font-bold text-white mb-4">Something went wrong</h1>
        <p className="text-white/40 mb-8">{error.message || 'An unexpected error occurred'}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="btn-primary px-6 py-3">Try Again</button>
          <Link href="/" className="btn-secondary px-6 py-3">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
