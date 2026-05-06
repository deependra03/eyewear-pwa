import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');

  const where: any = {};
  if (status) where.orderStatus = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const ordersWithNumbers = orders.map((order) => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }));

  // Dashboard stats if page 1
  let stats = null;
  if (page === 1) {
    const [revenue, totalOrders, totalProducts, totalUsers] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { orderStatus: { not: 'CANCELLED' } } }),
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);
    stats = {
      revenue: Number(revenue._sum.totalAmount || 0),
      totalOrders,
      totalProducts,
      totalUsers,
    };
  }

  return NextResponse.json({ orders: ordersWithNumbers, total, page, totalPages: Math.ceil(total / limit), stats });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId, orderStatus, paymentStatus } = await req.json();

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { ...(orderStatus && { orderStatus }), ...(paymentStatus && { paymentStatus }) },
  });

  return NextResponse.json({ order });
}
