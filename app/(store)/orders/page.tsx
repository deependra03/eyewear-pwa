'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'bg-blue-500/20 text-blue-400',
  CONFIRMED: 'bg-yellow-500/20 text-yellow-400',
  SHIPPED: 'bg-purple-500/20 text-purple-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { router.push('/login'); return; }
    fetch('/api/orders').then((r) => r.json()).then((d) => {
      setOrders(d.orders || []);
      setLoading(false);
    });
  }, [session]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <span className="text-5xl">📦</span>
          <h2 className="text-white text-xl font-bold mt-4 mb-2">No orders yet</h2>
          <p className="text-white/40 mb-6">Your order history will appear here</p>
          <Link href="/products" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-semibold">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-white/40 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'bg-white/10 text-white'} px-3 py-1`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]?.url || `https://picsum.photos/seed/${item.productId}/60/60`}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-dark-600"
                    />
                    <div className="flex-1">
                      <Link href={`/products/${item.product.slug}`} className="text-white text-sm hover:text-brand-400 transition-colors">
                        {item.product.name}
                      </Link>
                      <p className="text-white/40 text-xs">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <span className="text-white text-sm font-medium">{formatPrice(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-xs">Payment: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</p>
                  <p className="text-white/40 text-xs">
                    {order.address.line1}, {order.address.city} — {order.address.pincode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs">Total</p>
                  <p className="text-white font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
