import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendOrderConfirmationEmail } from '@/lib/email';

const orderSchema = z.object({
  addressId: z.string(),
  paymentMethod: z.enum(['COD', 'ONLINE']),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number(),
    })
  ),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
        address: true,
      },
    });

    const ordersWithNumbers = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          sellingPrice: Number(item.product.sellingPrice),
          purchasePrice: Number(item.product.purchasePrice),
          discountPercent: Number(item.product.discountPercent),
        },
      })),
    }));

    return NextResponse.json({ orders: ordersWithNumbers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const data = orderSchema.parse(body);

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: data.addressId, userId },
    });
    if (!address) return NextResponse.json({ error: 'Invalid address' }, { status: 400 });

    // Calculate total & validate products
    let totalAmount = 0;
    const orderItems = [];
    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Product not available` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
      totalAmount += item.price * item.quantity;
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: item.price });
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId: data.addressId,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          orderStatus: 'PLACED',
          totalAmount,
          items: { create: orderItems },
        },
        include: {
          items: { include: { product: true } },
          address: true,
        },
      });

      // Decrement stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // Send confirmation email (non-blocking)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      sendOrderConfirmationEmail(user.email, {
        orderId: order.id,
        customerName: user.name,
        items: order.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        total: Number(order.totalAmount),
        address: `${address.line1}, ${address.city}, ${address.state} - ${address.pincode}`,
        paymentMethod: data.paymentMethod,
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
