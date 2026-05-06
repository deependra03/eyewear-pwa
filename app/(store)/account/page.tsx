'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';

export default function AccountPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => { if (!session) router.push('/login'); }, [session]);
  if (!session) return null;

  const user = session.user as any;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Account</h1>

      <div className="card p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-500/20 border-2 border-brand-500/50 flex items-center justify-center text-brand-400 font-bold text-2xl">
            {getInitials(user.name || 'U')}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user.name}</h2>
            <p className="text-white/40">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="badge bg-brand-500/20 text-brand-400 mt-1">Admin</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/orders" className="card p-4 hover:border-brand-500/30 transition-all group">
            <span className="text-2xl">📦</span>
            <p className="text-white font-medium mt-2 group-hover:text-brand-400 transition-colors">My Orders</p>
            <p className="text-white/40 text-xs">Track & manage orders</p>
          </Link>
          <Link href="/wishlist" className="card p-4 hover:border-brand-500/30 transition-all group">
            <span className="text-2xl">❤️</span>
            <p className="text-white font-medium mt-2 group-hover:text-brand-400 transition-colors">Wishlist</p>
            <p className="text-white/40 text-xs">Saved items</p>
          </Link>
          {user.role === 'ADMIN' && (
            <Link href="/admin" className="card p-4 hover:border-brand-500/30 transition-all group">
              <span className="text-2xl">⚙️</span>
              <p className="text-white font-medium mt-2 group-hover:text-brand-400 transition-colors">Admin Panel</p>
              <p className="text-white/40 text-xs">Manage store</p>
            </Link>
          )}
          <button onClick={() => signOut({ callbackUrl: '/' })} className="card p-4 hover:border-red-500/30 transition-all group text-left">
            <span className="text-2xl">🚪</span>
            <p className="text-white font-medium mt-2 group-hover:text-red-400 transition-colors">Sign Out</p>
            <p className="text-white/40 text-xs">Log out of your account</p>
          </button>
        </div>
      </div>
    </div>
  );
}
