'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: '',
    categoryId: '',
    purchasePrice: '',
    sellingPrice: '',
    discountPercent: '0',
    stock: '0',
    isActive: true,
    isFeatured: false,
    model3dUrl: '',
    images: [] as Array<{ url: string; isPrimary: boolean; altText: string }>,
    images360: [] as string[],
    variants: [] as Array<{ color: string; size: string; sku: string; stock: number }>,
  });

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        brand: initialData.brand || '',
        categoryId: initialData.categoryId || '',
        purchasePrice: String(initialData.purchasePrice || ''),
        sellingPrice: String(initialData.sellingPrice || ''),
        discountPercent: String(initialData.discountPercent || '0'),
        stock: String(initialData.stock || '0'),
        isActive: initialData.isActive ?? true,
        isFeatured: initialData.isFeatured ?? false,
        model3dUrl: initialData.model3dUrl || '',
        images: initialData.images || [],
        images360: initialData.images360 || [],
        variants: initialData.variants || [],
      });
    }
  }, [initialData]);

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `eyewear/${folder}`);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploading('images');
    try {
      for (const file of files) {
        const url = await uploadFile(file, 'products');
        setForm((f) => ({
          ...f,
          images: [...f.images, { url, isPrimary: f.images.length === 0, altText: f.name }],
        }));
      }
      toast.success('Images uploaded!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(null);
    }
  };

  const handle360Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).sort((a, b) => a.name.localeCompare(b.name));
    setUploading('360');
    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadFile(file, '360');
        urls.push(url);
      }
      setForm((f) => ({ ...f, images360: [...f.images360, ...urls] }));
      toast.success(`${urls.length} 360° images uploaded!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(null);
    }
  };

  const handle3DUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('3d');
    try {
      const url = await uploadFile(file, '3d-models');
      setForm((f) => ({ ...f, model3dUrl: url }));
      toast.success('3D model uploaded!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(null);
    }
  };

  const addVariant = () => {
    setForm((f) => ({ ...f, variants: [...f.variants, { color: '', size: '', sku: `SKU-${Date.now()}`, stock: 0 }] }));
  };

  const removeVariant = (i: number) => {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  };

  const finalPrice = form.sellingPrice
    ? Number(form.sellingPrice) * (1 - Number(form.discountPercent) / 100)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        discountPercent: Number(form.discountPercent),
        stock: parseInt(form.stock),
      };

      const url = productId ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = productId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed'); return; }

      toast.success(productId ? 'Product updated!' : 'Product created!');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Product Name *</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. Classic Aviator Frame" />
            {form.name && <p className="text-white/30 text-xs mt-1">Slug: {slugify(form.name)}</p>}
          </div>
          <div>
            <label className="label">Brand</label>
            <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="input-field" placeholder="VisionPro" />
          </div>
          <div>
            <label className="label">Category *</label>
            <select required value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="input-field">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Description *</label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field resize-none" placeholder="Describe this product..." />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">Pricing & Stock</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Purchase Price (₹) *</label>
            <input required type="number" min={0} step={0.01} value={form.purchasePrice} onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value }))} className="input-field" placeholder="499" />
          </div>
          <div>
            <label className="label">Selling Price (₹) *</label>
            <input required type="number" min={0} step={0.01} value={form.sellingPrice} onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))} className="input-field" placeholder="999" />
          </div>
          <div>
            <label className="label">Discount (%)</label>
            <input type="number" min={0} max={100} value={form.discountPercent} onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))} className="input-field" placeholder="20" />
          </div>
          <div>
            <label className="label">Stock Quantity *</label>
            <input required type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="input-field" placeholder="50" />
          </div>
        </div>
        {finalPrice > 0 && (
          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 text-sm">
            <span className="text-white/60">Final customer price: </span>
            <span className="text-brand-400 font-bold text-lg">₹{finalPrice.toFixed(0)}</span>
            {Number(form.discountPercent) > 0 && <span className="text-white/40 ml-2">(saving ₹{(Number(form.sellingPrice) - finalPrice).toFixed(0)})</span>}
          </div>
        )}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-orange-500 w-4 h-4" />
            <span className="text-white/70 text-sm">Active (visible in store)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="accent-orange-500 w-4 h-4" />
            <span className="text-white/70 text-sm">Featured (on homepage)</span>
          </label>
        </div>
      </div>

      {/* Product Images */}
      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">📷 Product Images</h2>
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading === 'images' ? 'border-brand-500 bg-brand-500/10' : 'border-white/20 hover:border-brand-500/50'}`}>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
          {uploading === 'images' ? (
            <p className="text-brand-400">Uploading...</p>
          ) : (
            <>
              <p className="text-white/60 text-sm">Click to upload product images</p>
              <p className="text-white/30 text-xs mt-1">PNG, JPG, WebP supported</p>
            </>
          )}
        </label>
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.url} alt="" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                {img.isPrimary && <span className="absolute top-1 left-1 bg-brand-500 text-white text-xs px-1 rounded">Primary</span>}
                <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.map((im, idx) => ({ ...im, isPrimary: idx === i })) }))} className="text-white text-xs bg-brand-500 px-1.5 py-0.5 rounded">Primary</button>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="text-white text-xs bg-red-500 px-1.5 py-0.5 rounded">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 360 images */}
      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">🔄 360° View Images</h2>
        <p className="text-white/40 text-sm">Upload 24–36 images taken sequentially around the product. They'll be sorted alphabetically by filename.</p>
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading === '360' ? 'border-brand-500 bg-brand-500/10' : 'border-white/20 hover:border-brand-500/50'}`}>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handle360Upload} />
          {uploading === '360' ? <p className="text-brand-400">Uploading... ({form.images360.length} done)</p> : <p className="text-white/60 text-sm">Upload 360° image sequence ({form.images360.length} uploaded)</p>}
        </label>
        {form.images360.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm">✓ {form.images360.length} frames uploaded</span>
            <button type="button" onClick={() => setForm((f) => ({ ...f, images360: [] }))} className="text-red-400 text-xs hover:text-red-300">Clear all</button>
          </div>
        )}
      </div>

      {/* 3D Model */}
      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">🥽 3D Try-On Model</h2>
        <p className="text-white/40 text-sm">Upload a .glb or .usdz 3D model file for AR try-on functionality.</p>
        <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading === '3d' ? 'border-brand-500 bg-brand-500/10' : 'border-white/20 hover:border-brand-500/50'}`}>
          <input type="file" accept=".glb,.usdz,.gltf" className="hidden" onChange={handle3DUpload} />
          {uploading === '3d' ? <p className="text-brand-400">Uploading 3D model...</p> : <p className="text-white/60 text-sm">{form.model3dUrl ? '✓ 3D model uploaded — click to replace' : 'Upload .glb or .usdz model'}</p>}
        </label>
        {form.model3dUrl && (
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm text-xs truncate">✓ {form.model3dUrl.split('/').pop()}</span>
            <button type="button" onClick={() => setForm((f) => ({ ...f, model3dUrl: '' }))} className="text-red-400 text-xs">Remove</button>
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Variants (optional)</h2>
          <button type="button" onClick={addVariant} className="btn-secondary py-2 px-4 text-sm">+ Add Variant</button>
        </div>
        {form.variants.map((variant, i) => (
          <div key={i} className="grid grid-cols-4 gap-3 p-3 bg-dark-700 rounded-xl">
            <div><label className="label text-xs">Color</label><input value={variant.color} onChange={(e) => setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? { ...v, color: e.target.value } : v) }))} className="input-field py-2 text-sm" placeholder="Black" /></div>
            <div><label className="label text-xs">Size</label><input value={variant.size} onChange={(e) => setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? { ...v, size: e.target.value } : v) }))} className="input-field py-2 text-sm" placeholder="Medium" /></div>
            <div><label className="label text-xs">SKU *</label><input required value={variant.sku} onChange={(e) => setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? { ...v, sku: e.target.value } : v) }))} className="input-field py-2 text-sm" /></div>
            <div className="flex gap-2 items-end">
              <div className="flex-1"><label className="label text-xs">Stock</label><input type="number" value={variant.stock} onChange={(e) => setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? { ...v, stock: parseInt(e.target.value) || 0 } : v) }))} className="input-field py-2 text-sm" /></div>
              <button type="button" onClick={() => removeVariant(i)} className="pb-1 text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="btn-primary px-8 py-4 text-base">
          {loading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} className="btn-secondary px-8 py-4">
          Cancel
        </button>
      </div>
    </form>
  );
}
