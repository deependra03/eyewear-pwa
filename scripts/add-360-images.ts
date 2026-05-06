import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function add360Images() {
  try {
    console.log('Adding 360° images to Classic Aviator Frame...');
    
    const product = await prisma.product.findUnique({
      where: { slug: 'classic-aviator-frame' },
    });

    if (!product) {
      console.log('Product not found. Creating it first...');
      // Find or create the eyeglasses category
      let category = await prisma.category.findUnique({
        where: { slug: 'eyeglasses' },
      });
      
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: 'Eyeglasses',
            slug: 'eyeglasses',
          },
        });
      }

      const newProduct = await prisma.product.create({
        data: {
          name: 'Classic Aviator Frame',
          slug: 'classic-aviator-frame',
          description: 'Timeless aviator style with premium metal frame. Perfect for everyday wear with UV400 protection lenses.',
          brand: 'VisionPro',
          categoryId: category.id,
          purchasePrice: 599,
          sellingPrice: 1299,
          discountPercent: 20,
          stock: 45,
          isFeatured: true,
          isActive: true,
        },
      });

      // Add primary image
      await prisma.productImage.create({
        data: {
          productId: newProduct.id,
          url: `https://picsum.photos/seed/classic-aviator-frame/800/600`,
          altText: 'Classic Aviator Frame',
          isPrimary: true,
        },
      });

      // Add 360° images
      const images360 = [];
      for (let i = 0; i < 12; i++) {
        images360.push(`https://picsum.photos/seed/classic-aviator-frame-360-${i}/800/800`);
      }

      await prisma.product.update({
        where: { id: newProduct.id },
        data: { images360 },
      });

      console.log('Product created with 360° images!');
    } else {
      // Update existing product with 360° images
      const images360 = [];
      for (let i = 0; i < 12; i++) {
        images360.push(`https://picsum.photos/seed/classic-aviator-frame-360-${i}/800/800`);
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { images360 },
      });

      console.log('360° images added to existing product!');
    }

    console.log('Done! Visit /products/classic-aviator-frame to see the 360° view feature.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

add360Images();
