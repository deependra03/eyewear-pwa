'use client';
import Link from 'next/link';
import { formatPrice, calculateDiscountedPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/cartStore';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    brand?: string | null;
    sellingPrice: number | string;
    discountPercent: number | string;
    stock: number;
    images: Array<{ url: string; altText?: string | null }>;
    category?: { name: string; slug: string };
    avgRating?: number;
    reviewCount?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const addToCart = useCartStore((s) => s.add);
  const setOpen = useCartStore((s) => s.setOpen);
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const sellingPrice = Number(product.sellingPrice);
  const discountPercent = Number(product.discountPercent);
  const finalPrice = discountPercent > 0 ? calculateDiscountedPrice(sellingPrice, discountPercent) : sellingPrice;
  const image = product.images[0]?.url || `https://picsum.photos/seed/${product.slug}/400/300`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image,
      quantity: 1,
      slug: product.slug,
    });
    toast.success('Added to cart!');
    setOpen(true);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error('Please sign in to wishlist');
      return;
    }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      setWishlisted(data.action === 'added');
      toast.success(data.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className="group card hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-dark-600">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Discount badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {discountPercent}% OFF
            </div>
          )}

          {/* Out of stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-dark-800/80 px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              wishlisted
                ? 'bg-brand-500 text-white'
                : 'bg-dark-900/60 text-white/70 hover:bg-dark-900 hover:text-white opacity-0 group-hover:opacity-100'
            }`}
          >
            <svg className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Quick add button */}
          <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-600 text-white py-3 text-sm font-semibold transition-colors"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
          )}
          <h3 className="text-white font-medium text-sm line-clamp-1 mb-2">{product.name}</h3>

          {/* Rating */}
          {product.avgRating !== undefined && product.avgRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-3 h-3 ${star <= Math.round(product.avgRating!) ? 'text-yellow-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-white/40">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{formatPrice(finalPrice)}</span>
            {discountPercent > 0 && (
              <span className="text-white/30 text-sm line-through">{formatPrice(sellingPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
