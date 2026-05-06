'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchProducts = () => {
    fetch('/api/admin/products?limit=50').then((r) => r.json()).then((d) => {
      setProducts(d.products || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleStockSave = async (productId: string) => {
    const newStock = stockEdits[productId];
    if (newStock === undefined) return;
    setSaving(productId);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock }),
    });
    if (res.ok) {
      toast.success('Stock updated!');
      fetchProducts();
      setStockEdits((s) => { const n = { ...s }; delete n[productId]; return n; });
    } else {
      toast.error('Failed to update stock');
    }
    setSaving(null);
  };

  const handleToggleActive = async (productId: string, current: boolean) => {
    await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchProducts();
    toast.success(!current ? 'Product activated' : 'Product deactivated');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Products</h1>
          <p className="text-white/40 mt-1">{products.length} total products</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <span>+</span> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-white/40 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-center px-4 py-3">Stock</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]?.url || `https://picsum.photos/seed/${product.id}/40/40`}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-dark-600"
                        />
                        <div>
                          <p className="text-white font-medium line-clamp-1">{product.name}</p>
                          {product.brand && <p className="text-white/40 text-xs">{product.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-white/60">{product.category.name}</td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-white font-medium">{formatPrice(product.sellingPrice)}</p>
                      {Number(product.discountPercent) > 0 && (
                        <p className="text-brand-400 text-xs">{product.discountPercent}% off</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={stockEdits[product.id] ?? product.stock}
                          onChange={(e) => setStockEdits((s) => ({ ...s, [product.id]: parseInt(e.target.value) || 0 }))}
                          className="w-16 bg-dark-600 border border-white/10 rounded-lg px-2 py-1 text-white text-center text-sm focus:outline-none focus:border-brand-500"
                        />
                        {stockEdits[product.id] !== undefined && (
                          <button
                            onClick={() => handleStockSave(product.id)}
                            disabled={saving === product.id}
                            className="text-xs bg-brand-500 text-white px-2 py-1 rounded-lg hover:bg-brand-600 transition-colors"
                          >
                            {saving === product.id ? '...' : 'Save'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        className={`badge px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
                          product.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {product.isActive ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-white/40 hover:text-brand-400 transition-colors text-sm"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
