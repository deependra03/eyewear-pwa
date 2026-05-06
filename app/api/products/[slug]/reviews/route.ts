import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rating, comment } = await req.json();
  const userId = (session.user as any).id;

  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const review = await prisma.review.create({
    data: { userId, productId: product.id, rating: Math.min(5, Math.max(1, rating)), comment },
  });

  return NextResponse.json({ review }, { status: 201 });
}
