import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';

export default function NewProductPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-white/40 hover:text-white transition-colors">← Products</Link>
        <span className="text-white/20">/</span>
        <h1 className="font-display text-3xl font-bold text-white">Add New Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}



