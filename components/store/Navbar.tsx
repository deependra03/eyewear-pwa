'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/lib/cartStore';
import { useState, useEffect } from 'react';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { data: session } = useSession();
  const count = useCartStore((s) => s.count());
  const setOpen = useCartStore((s) => s.setOpen);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-dark-900/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-brand-500 text-2xl">👓</span>
              <span className="font-display text-xl font-bold text-white">EyeWear</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products?category=eyeglasses" className="text-white/70 hover:text-white text-sm transition-colors">
                Eyeglasses
              </Link>
              <Link href="/products?category=sunglasses" className="text-white/70 hover:text-white text-sm transition-colors">
                Sunglasses
              </Link>
              <Link href="/products?category=contact-lenses" className="text-white/70 hover:text-white text-sm transition-colors">
                Contacts
              </Link>
              <Link href="/products?category=computer-glasses" className="text-white/70 hover:text-white text-sm transition-colors">
                Computer Glasses
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Wishlist */}
              {session && (
                <Link href="/wishlist" className="p-2 text-white/70 hover:text-white transition-colors" aria-label="Wishlist">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setOpen(true)}
                className="relative p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Cart"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>

              {/* Auth */}
              {session ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/50 flex items-center justify-center text-brand-400 font-bold text-xs">
                      {session.user?.name?.[0]?.toUpperCase()}
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-dark-700 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                    {isAdmin && (
                      <Link href="/admin" className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link href="/account" className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      My Account
                    </Link>
                    <Link href="/orders" className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      My Orders
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors border-t border-white/10"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="text-sm btn-primary py-2 px-4">
                  Sign In
                </Link>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 border-t border-white/10 mt-2 pt-4 space-y-2">
              {['eyeglasses', 'sunglasses', 'contact-lenses', 'computer-glasses'].map((cat) => (
                <Link
                  key={cat}
                  href={`/products?category=${cat}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-2 py-2 text-white/70 hover:text-white capitalize transition-colors"
                >
                  {cat.replace('-', ' ')}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-2xl bg-dark-700 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 p-4">
              <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery) {
                    window.location.href = `/products?search=${searchQuery}`;
                  }
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
                placeholder="Search eyeglasses, sunglasses..."
                className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-lg"
              />
              <button onClick={() => setSearchOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 pb-4 text-sm text-white/30">
              Press Enter to search · Esc to close
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
    </>
  );
}
