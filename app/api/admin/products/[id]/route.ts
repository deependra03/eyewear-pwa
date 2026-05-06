import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return null;
  return session;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true, category: true },
  });

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  const productWithNumbers = {
    ...product,
    sellingPrice: Number(product.sellingPrice),
    purchasePrice: Number(product.purchasePrice),
    discountPercent: Number(product.discountPercent),
  };
  
  return NextResponse.json({ product: productWithNumbers });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { images, variants, ...productData } = body;

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: params.id },
        data: productData,
      });

      if (images) {
        await tx.productImage.deleteMany({ where: { productId: params.id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: any) => ({ ...img, productId: params.id })),
          });
        }
      }

      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: params.id } });
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v: any) => ({ ...v, productId: params.id })),
          });
        }
      }

      return updated;
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.product.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
