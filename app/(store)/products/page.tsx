'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Discount' },
];

const CATEGORIES = [
  { slug: 'eyeglasses', name: 'Eyeglasses' },
  { slug: 'sunglasses', name: 'Sunglasses' },
  { slug: 'contact-lenses', name: 'Contact Lenses' },
  { slug: 'computer-glasses', name: 'Computer Glasses' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const featured = searchParams.get('featured') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (page > 1) params.set('page', String(page));
      if (search) params.set('search', search);
      if (featured) params.set('featured', featured);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, sort, page, search, featured, minPrice, maxPrice]);

  const pageTitle = category
    ? CATEGORIES.find((c) => c.slug === category)?.name || 'Products'
    : featured
    ? 'Featured Collection'
    : search
    ? `Search: "${search}"`
    : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">{pageTitle}</h1>
          {!loading && <p className="text-white/40 text-sm mt-1">{total} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center gap-2 bg-dark-700 border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
          </button>
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input-field py-2.5 text-sm w-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-60 flex-shrink-0 space-y-6`}>
          {/* Category */}
          <div className="card p-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Category</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', '')}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!category ? 'bg-brand-500/20 text-brand-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${category === cat.slug ? 'bg-brand-500/20 text-brand-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="card p-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Price Range</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                  className="input-field py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                  className="input-field py-2 text-sm"
                />
              </div>
              <button
                onClick={() => {
                  updateParam('minPrice', priceRange.min);
                  updateParam('maxPrice', priceRange.max);
                }}
                className="w-full btn-primary py-2 text-sm"
              >
                Apply
              </button>
              {(minPrice || maxPrice) && (
                <button
                  onClick={() => {
                    setPriceRange({ min: '', max: '' });
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('minPrice');
                    params.delete('maxPrice');
                    router.push(`/products?${params.toString()}`);
                  }}
                  className="w-full text-white/40 hover:text-white text-sm transition-colors"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Quick filters */}
          <div className="card p-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Quick Filters</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('featured', featured ? '' : 'true')}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${featured ? 'bg-brand-500/20 text-brand-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                ⭐ Featured Only
              </button>
              <button
                onClick={() => updateParam('sort', 'discount')}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${sort === 'discount' ? 'bg-brand-500/20 text-brand-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                🏷️ Best Deals
              </button>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton aspect-[4/3]" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-5 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <h3 className="text-white text-xl font-semibold mb-2">No products found</h3>
              <p className="text-white/40 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={() => router.push('/products')} className="btn-primary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParam('page', String(p))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        p === page ? 'bg-brand-500 text-white' : 'bg-dark-700 text-white/60 hover:text-white border border-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
