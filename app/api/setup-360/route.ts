import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Adding 360° images to Classic Aviator Frame...');
    
    const product = await prisma.product.findUnique({
      where: { slug: 'classic-aviator-frame' },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Add 360° images
    const images360 = [];
    for (let i = 0; i < 12; i++) {
      images360.push(`https://picsum.photos/seed/classic-aviator-frame-360-${i}/800/800`);
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { images360 },
    });

    return NextResponse.json({ 
      success: true, 
      message: '360° images added successfully!',
      imagesCount: images360.length 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
