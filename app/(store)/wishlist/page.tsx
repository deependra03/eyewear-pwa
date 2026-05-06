'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';

export default function WishlistPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { router.push('/login'); return; }
    fetch('/api/wishlist').then((r) => r.json()).then((d) => {
      setWishlist(d.wishlist || []);
      setLoading(false);
    });
  }, [session]);

  const products = wishlist.map((w) => ({
    ...w.product,
    avgRating: 0,
    reviewCount: 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-2">My Wishlist</h1>
      <p className="text-white/40 mb-8">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <span className="text-5xl">🤍</span>
          <h2 className="text-white text-xl font-bold mt-4 mb-2">Your wishlist is empty</h2>
          <p className="text-white/40 mb-6">Save items you love and come back to them later</p>
          <Link href="/products" className="btn-primary inline-block">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
