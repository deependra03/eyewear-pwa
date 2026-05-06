import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const { name, slug, image } = await req.json();
  const category = await prisma.category.create({ data: { name, slug, image } });
  return NextResponse.json({ category }, { status: 201 });
}
