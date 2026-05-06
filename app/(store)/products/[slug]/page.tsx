'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/lib/cartStore';
import { formatPrice, calculateDiscountedPrice } from '@/lib/utils';
import Viewer360 from '@/components/store/Viewer360';
import TryOn3D from '@/components/store/TryOn3D';
import toast from 'react-hot-toast';
import Link from 'next/link';

type ViewMode = 'images' | '360' | '3d';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const addToCart = useCartStore((s) => s.add);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('images');
  const [wishlisted, setWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [try3DOpen, setTry3DOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-6 w-32 rounded" />
            <div className="skeleton h-10 w-full rounded" />
            <div className="skeleton h-8 w-40 rounded" />
            <div className="skeleton h-32 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-white text-2xl font-bold mb-2">Product not found</h2>
        <Link href="/products" className="btn-primary mt-4">Browse Products</Link>
      </div>
    );
  }

  const sellingPrice = Number(product.sellingPrice);
  const discountPercent = Number(product.discountPercent);
  const finalPrice = discountPercent > 0 ? calculateDiscountedPrice(sellingPrice, discountPercent) : sellingPrice;
  const savings = sellingPrice - finalPrice;

  const handleAddToCart = () => {
    const image = product.images[0]?.url || '';
    for (let i = 0; i < quantity; i++) {
      addToCart({ productId: product.id, name: product.name, price: finalPrice, image, quantity: 1, slug: product.slug });
    }
    toast.success(`${product.name} added to cart!`);
    setCartOpen(true);
  };

  const handleWishlist = async () => {
    if (!session) { toast.error('Please sign in first'); return; }
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    });
    const data = await res.json();
    setWishlisted(data.action === 'added');
    toast.success(data.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist');
  };

  const handleReview = async () => {
    if (!session) { toast.error('Please sign in to review'); return; }
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (res.ok) {
        toast.success('Review submitted!');
        setReview({ rating: 5, comment: '' });
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white transition-colors">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-white transition-colors capitalize">{product.category.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-white/70 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Image/viewer */}
        <div className="space-y-4">
          {/* View mode tabs */}
          <div className="flex items-center gap-2">
            {['images', ...(product.images360?.length > 0 ? ['360'] : []), ...(product.model3dUrl ? ['3d'] : [])].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as ViewMode)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === mode ? 'bg-brand-500 text-white' : 'bg-dark-700 text-white/60 hover:text-white border border-white/10'
                }`}
              >
                {mode === 'images' ? '📷 Photos' : mode === '360' ? '🔄 360°' : '🥽 3D Try-On'}
              </button>
            ))}
          </div>

          {/* Main viewer */}
          <div className="relative aspect-square bg-dark-700 rounded-2xl overflow-hidden border border-white/5">
            {viewMode === 'images' && (
              <img
                src={product.images[selectedImage]?.url || `https://picsum.photos/seed/${product.slug}/800/800`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
            {viewMode === '360' && <Viewer360 images={product.images360 || []} />}
            {viewMode === '3d' && product.model3dUrl && (
              <TryOn3D modelUrl={product.model3dUrl} productName={product.name} />
            )}
          </div>

          {/* Thumbnails */}
          {viewMode === 'images' && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-brand-500' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product info */}
        <div className="space-y-6">
          {product.brand && (
            <p className="text-brand-400 text-sm font-bold uppercase tracking-widest">{product.brand}</p>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{product.name}</h1>

          {/* Rating */}
          {product.avgRating > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className={`w-4 h-4 ${s <= Math.round(product.avgRating) ? 'text-yellow-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white/60 text-sm">{product.avgRating.toFixed(1)} ({product.reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="font-display text-4xl font-bold text-white">{formatPrice(finalPrice)}</span>
            {discountPercent > 0 && (
              <>
                <span className="text-white/40 text-xl line-through">{formatPrice(sellingPrice)}</span>
                <span className="bg-brand-500 text-white text-sm font-bold px-2.5 py-1 rounded-full">{discountPercent}% OFF</span>
              </>
            )}
          </div>
          {savings > 0 && (
            <p className="text-green-400 text-sm">You save {formatPrice(savings)}!</p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div>
              <p className="text-white/60 text-sm font-medium mb-2">Available Colors</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button key={v.id} className="px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-sm hover:border-brand-500 hover:text-brand-400 transition-all">
                    {v.color || v.size || v.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-white/60 text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-white hover:border-brand-500 transition-all">−</button>
              <span className="text-white font-semibold w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-white hover:border-brand-500 transition-all">+</button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 btn-primary py-4 text-base">
              {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
            <button onClick={handleWishlist} className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${wishlisted ? 'border-brand-500 bg-brand-500/20 text-brand-400' : 'border-white/20 text-white/60 hover:border-brand-500'}`}>
              <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Delivery info */}
          <div className="grid grid-cols-3 gap-3">
            {[['🚚', 'Free Delivery', 'Above ₹999'], ['↩️', 'Easy Returns', '30 days'], ['💳', 'COD', 'Available']].map(([icon, label, sub]) => (
              <div key={label} className="bg-dark-700 rounded-xl p-3 text-center border border-white/5">
                <span className="text-xl">{icon}</span>
                <p className="text-white text-xs font-medium mt-1">{label}</p>
                <p className="text-white/30 text-xs">{sub}</p>
              </div>
            ))}
          </div>

          {/* Description accordion */}
          <div className="space-y-2">
            <details className="group bg-dark-700 rounded-xl border border-white/5 overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium list-none">
                Description
                <svg className="w-4 h-4 text-white/40 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 pb-4 text-white/60 text-sm leading-relaxed">{product.description}</div>
            </details>
            <details className="group bg-dark-700 rounded-xl border border-white/5 overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium list-none">
                Specifications
                <svg className="w-4 h-4 text-white/40 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 pb-4 space-y-2 text-sm">
                {product.brand && <div className="flex justify-between"><span className="text-white/40">Brand</span><span className="text-white">{product.brand}</span></div>}
                {product.category && <div className="flex justify-between"><span className="text-white/40">Category</span><span className="text-white">{product.category.name}</span></div>}
                <div className="flex justify-between"><span className="text-white/40">SKU</span><span className="text-white">{product.id.slice(-8).toUpperCase()}</span></div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-white mb-8">Customer Reviews</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Review list */}
          <div className="space-y-4">
            {product.reviews.length === 0 ? (
              <p className="text-white/40">No reviews yet. Be the first to review!</p>
            ) : (
              product.reviews.map((r: any) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">
                        {r.user.name[0]}
                      </div>
                      <span className="text-white font-medium text-sm">{r.user.name}</span>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-white/60 text-sm">{r.comment}</p>}
                  <p className="text-white/20 text-xs mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>

          {/* Write review */}
          {session && (
            <div className="card p-6">
              <h3 className="text-white font-semibold mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setReview((r) => ({ ...r, rating: s }))}
                        className={`w-8 h-8 transition-colors ${s <= review.rating ? 'text-yellow-400' : 'text-white/20 hover:text-yellow-400/60'}`}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Comment (optional)</label>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Share your experience..."
                  />
                </div>
                <button onClick={handleReview} disabled={submittingReview} className="btn-primary w-full">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
