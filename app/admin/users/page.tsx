import { prisma } from '@/lib/prisma';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Users</h1>
        <p className="text-white/40 mt-1">{users.length} registered users</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-center px-4 py-3">Role</th>
                <th className="text-center px-4 py-3">Orders</th>
                <th className="text-center px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-white/40 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-white/60">{user.phone || '—'}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`badge px-2 py-0.5 text-xs ${user.role === 'ADMIN' ? 'bg-brand-500/20 text-brand-400' : 'bg-white/10 text-white/60'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-white">{user._count.orders}</td>
                  <td className="px-4 py-4 text-center text-white/40 text-xs">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
