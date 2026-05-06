import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl mb-6">👓</p>
        <h1 className="font-display text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-white/40 text-lg mb-8">Oops! This page seems to have slipped off the frame.</p>
        <Link href="/" className="btn-primary inline-block px-8 py-4 text-base">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
