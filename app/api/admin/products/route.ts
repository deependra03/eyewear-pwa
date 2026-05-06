import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { slugify } from '@/lib/utils';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  brand: z.string().optional(),
  categoryId: z.string(),
  purchasePrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  discountPercent: z.number().min(0).max(100).default(0),
  stock: z.number().int().min(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  model3dUrl: z.string().optional(),
  images360: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string(), isPrimary: z.boolean(), altText: z.string().optional() })).default([]),
  variants: z.array(z.object({ color: z.string().optional(), size: z.string().optional(), sku: z.string(), stock: z.number() })).default([]),
});

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

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.product.count(),
  ]);

  const productsWithNumbers = products.map((p) => ({
    ...p,
    sellingPrice: Number(p.sellingPrice),
    purchasePrice: Number(p.purchasePrice),
    discountPercent: Number(p.discountPercent),
  }));

  return NextResponse.json({ products: productsWithNumbers, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = productSchema.parse(body);
    const slug = slugify(data.name);

    // Ensure slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: data.name,
          slug: finalSlug,
          description: data.description,
          brand: data.brand,
          categoryId: data.categoryId,
          purchasePrice: data.purchasePrice,
          sellingPrice: data.sellingPrice,
          discountPercent: data.discountPercent,
          stock: data.stock,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          model3dUrl: data.model3dUrl,
          images360: data.images360,
        },
      });

      if (data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((img) => ({ ...img, productId: p.id })),
        });
      }

      if (data.variants.length > 0) {
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({ ...v, productId: p.id })),
        });
      }

      return p;
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
