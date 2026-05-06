'use client';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_COLORS: Record<string, string> = {
  PLACED: 'text-blue-400',
  CONFIRMED: 'text-yellow-400',
  SHIPPED: 'text-purple-400',
  DELIVERED: 'text-green-400',
  CANCELLED: 'text-red-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch('/api/admin/orders?limit=50').then((r) => r.json()).then((d) => {
      setOrders(d.orders || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId: string, orderStatus: string) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, orderStatus }),
    });
    if (res.ok) { toast.success('Order status updated!'); fetchOrders(); }
    else toast.error('Update failed');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Orders</h1>
        <p className="text-white/40 mt-1">{orders.length} total orders</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-white/30">No orders yet</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-white/40 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Order ID</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Items</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-center px-4 py-3">Payment</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    >
                      <td className="px-4 py-4">
                        <p className="text-white font-mono font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-white">{order.user.name}</p>
                        <p className="text-white/40 text-xs">{order.user.email}</p>
                      </td>
                      <td className="px-4 py-4 text-white/60">{order.items.length} item(s)</td>
                      <td className="px-4 py-4 text-right text-white font-semibold">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`badge px-2 py-0.5 text-xs ${order.paymentMethod === 'COD' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className={`bg-dark-600 border border-white/10 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:border-brand-500 ${STATUS_COLORS[order.orderStatus]}`}
                        >
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-center text-white/40 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-expanded`}>
                        <td colSpan={7} className="px-4 py-4 bg-dark-700/50">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/40 text-xs font-semibold uppercase mb-2">Items Ordered</p>
                              <div className="space-y-2">
                                {order.items.map((item: any) => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-white">{item.product.name} × {item.quantity}</span>
                                    <span className="text-white/60">{formatPrice(Number(item.price) * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs font-semibold uppercase mb-2">Delivery Address</p>
                              <div className="text-sm text-white/60 space-y-0.5">
                                <p className="text-white font-medium">{order.address.name} · {order.address.phone}</p>
                                <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                                <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
