import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductFormClient from './ProductFormClient';
import Link from 'next/link';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true, category: true },
  });

  if (!product) notFound();

  const productWithNumbers = {
    ...product,
    sellingPrice: Number(product.sellingPrice),
    purchasePrice: Number(product.purchasePrice),
    discountPercent: Number(product.discountPercent),
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-white/40 hover:text-white transition-colors">← Products</Link>
        <span className="text-white/20">/</span>
        <h1 className="font-display text-3xl font-bold text-white">Edit Product</h1>
      </div>
      <ProductFormClient initialData={productWithNumbers} productId={params.id} />
    </div>
  );
}
