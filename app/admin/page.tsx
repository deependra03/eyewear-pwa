import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

async function getStats() {
  const [revenue, totalOrders, totalProducts, totalUsers, recentOrders] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { orderStatus: { not: 'CANCELLED' } } }),
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } }, items: { select: { id: true } } },
    }),
  ]);
  return { revenue: Number(revenue._sum.totalAmount || 0), totalOrders, totalProducts, totalUsers, recentOrders };
}

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'text-blue-400',
  CONFIRMED: 'text-yellow-400',
  SHIPPED: 'text-purple-400',
  DELIVERED: 'text-green-400',
  CANCELLED: 'text-red-400',
};

export default async function AdminDashboard() {
  const { revenue, totalOrders, totalProducts, totalUsers, recentOrders } = await getStats();

  const stats = [
    { label: 'Total Revenue', value: formatPrice(revenue), icon: '💰', color: 'text-green-400', sub: 'All time' },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: '📦', color: 'text-blue-400', sub: 'All time' },
    { label: 'Active Products', value: totalProducts.toLocaleString(), icon: '👓', color: 'text-brand-400', sub: 'In catalogue' },
    { label: 'Customers', value: totalUsers.toLocaleString(), icon: '👥', color: 'text-purple-400', sub: 'Registered' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs ${stat.color} bg-current/10 px-2 py-0.5 rounded-full`} style={{ background: 'rgba(255,255,255,0.05)' }}>{stat.sub}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-white/40 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/products/new" className="card p-5 hover:border-brand-500/30 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-2xl">➕</div>
          <div>
            <p className="text-white font-semibold group-hover:text-brand-400 transition-colors">Add Product</p>
            <p className="text-white/40 text-xs">Upload new eyewear</p>
          </div>
        </Link>
        <Link href="/admin/orders" className="card p-5 hover:border-blue-500/30 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">📋</div>
          <div>
            <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">Manage Orders</p>
            <p className="text-white/40 text-xs">Update order statuses</p>
          </div>
        </Link>
        <Link href="/admin/products" className="card p-5 hover:border-purple-500/30 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">📦</div>
          <div>
            <p className="text-white font-semibold group-hover:text-purple-400 transition-colors">Manage Stock</p>
            <p className="text-white/40 text-xs">Update inventory</p>
          </div>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Recent Orders</h2>
          <Link href="/admin/orders" className="text-brand-400 text-sm hover:text-brand-300 transition-colors">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-white/40 text-sm">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-white/40 text-xs">{order.user.name} · {order.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${STATUS_COLORS[order.orderStatus] || 'text-white'}`}>{order.orderStatus}</p>
                  <p className="text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
