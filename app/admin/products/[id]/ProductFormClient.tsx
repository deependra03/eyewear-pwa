'use client';
import ProductForm from '@/components/admin/ProductForm';

export default function ProductFormClient({ initialData, productId }: { initialData: any; productId: string }) {
  return <ProductForm initialData={initialData} productId={productId} />;
}
