import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'EyeWear Store — Premium Glasses & Sunglasses',
};

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 8,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
      reviews: { select: { rating: true } },
    },
  });
}

async function getCategories() {
  return prisma.category.findMany({ take: 4 });
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);

  const productsWithRating = products.map((p) => ({
    ...p,
    sellingPrice: Number(p.sellingPrice),
    purchasePrice: Number(p.purchasePrice),
    discountPercent: Number(p.discountPercent),
    avgRating: p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0,
    reviewCount: p.reviews.length,
  }));

  const categoryIcons: Record<string, string> = {
    eyeglasses: '🕶️',
    sunglasses: '😎',
    'contact-lenses': '👁️',
    'computer-glasses': '💻',
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #f9731630 0%, transparent 60%), radial-gradient(circle at 70% 30%, #ea580c20 0%, transparent 60%)' }}
        />
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute top-40 right-40 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-white/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              New: 3D Try-On Available
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              See The World
              <span className="block text-brand-500">In Style</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Discover premium eyewear crafted for clarity and style. Try frames virtually with our 3D AR technology before you buy.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary text-base px-8 py-4">
                Shop Now
              </Link>
              <Link href="/products?featured=true" className="btn-secondary text-base px-8 py-4">
                View Collection
              </Link>
            </div>
            <div className="flex items-center gap-8 pt-4">
              {[['10K+', 'Happy Customers'], ['500+', 'Frame Styles'], ['Free', 'Home Delivery']].map(([num, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white font-display">{num}</div>
                  <div className="text-white/40 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-brand-500/10 rounded-full animate-pulse" />
              <div className="absolute inset-8 bg-brand-500/5 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center text-[180px]">👓</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">Browse By</p>
            <h2 className="section-title">Categories</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`}
              className="group card p-6 flex flex-col items-center text-center hover:border-brand-500/30 hover:-translate-y-1 transition-all duration-300">
              <span className="text-4xl mb-3">{categoryIcons[cat.slug] || '👓'}</span>
              <h3 className="text-white font-semibold group-hover:text-brand-400 transition-colors">{cat.name}</h3>
              <p className="text-white/30 text-xs mt-1">Shop now →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features banner */}
      <section className="bg-dark-800 border-y border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ['🚚', 'Free Delivery', 'On orders above ₹999'],
              ['↩️', 'Easy Returns', '30-day hassle-free returns'],
              ['💳', 'COD Available', 'Pay when you receive'],
              ['🔒', 'Secure Shopping', '100% safe & encrypted'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-white/30 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">Hand Picked</p>
            <h2 className="section-title">Featured Collection</h2>
          </div>
          <Link href="/products?featured=true" className="text-brand-400 hover:text-brand-300 text-sm transition-colors hidden md:block">
            View all →
          </Link>
        </div>
        {productsWithRating.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productsWithRating.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-4">👓</p>
            <p>No products yet. Check back soon!</p>
          </div>
        )}
        <div className="mt-10 text-center md:hidden">
          <Link href="/products" className="btn-secondary inline-block px-8">View All Products</Link>
        </div>
      </section>

      {/* 3D Try-on Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative bg-gradient-to-r from-brand-900/50 to-dark-700 rounded-3xl border border-brand-500/20 p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #f97316 0%, transparent 50%)' }}
          />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">New Feature</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Try Before You Buy With 3D AR
              </h2>
              <p className="text-white/50 leading-relaxed mb-6">
                Use your phone camera to virtually try on any frame. See exactly how they'll look on your face before ordering.
              </p>
              <Link href="/products" className="btn-primary inline-block">
                Try On Now
              </Link>
            </div>
            <div className="flex justify-center text-8xl md:text-9xl">🥽</div>
          </div>
        </div>
      </section>
    </div>
  );
}
