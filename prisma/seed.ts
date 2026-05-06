import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eyewear.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@eyewear.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create demo customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'customer@example.com',
      password: customerPassword,
      role: Role.CUSTOMER,
      phone: '9876543210',
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'eyeglasses' },
      update: {},
      create: { name: 'Eyeglasses', slug: 'eyeglasses', image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'sunglasses' },
      update: {},
      create: { name: 'Sunglasses', slug: 'sunglasses', image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'contact-lenses' },
      update: {},
      create: { name: 'Contact Lenses', slug: 'contact-lenses', image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg' },
    }),
    prisma.category.upsert({
      where: { slug: 'computer-glasses' },
      update: {},
      create: { name: 'Computer Glasses', slug: 'computer-glasses', image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/car-interior-design.jpg' },
    }),
  ]);

  // Create products
  const products = [
    {
      name: 'Classic Aviator Frame',
      slug: 'classic-aviator-frame',
      description: 'Timeless aviator style with premium metal frame. Perfect for everyday wear with UV400 protection lenses.',
      brand: 'VisionPro',
      categoryId: categories[0].id,
      purchasePrice: 599,
      sellingPrice: 1299,
      discountPercent: 20,
      stock: 45,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Round Retro Glasses',
      slug: 'round-retro-glasses',
      description: 'Vintage-inspired round frames crafted from premium acetate. A bold statement piece for the fashion-forward.',
      brand: 'StyleFrame',
      categoryId: categories[0].id,
      purchasePrice: 799,
      sellingPrice: 1799,
      discountPercent: 15,
      stock: 30,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Polarized Sport Sunglasses',
      slug: 'polarized-sport-sunglasses',
      description: 'High-performance polarized sunglasses designed for active lifestyles. 100% UV protection with anti-glare coating.',
      brand: 'ActiveVision',
      categoryId: categories[1].id,
      purchasePrice: 999,
      sellingPrice: 2499,
      discountPercent: 25,
      stock: 60,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Wayfarer Classic',
      slug: 'wayfarer-classic',
      description: 'The iconic wayfarer design that never goes out of style. Premium polycarbonate lenses with full UV400 protection.',
      brand: 'VisionPro',
      categoryId: categories[1].id,
      purchasePrice: 699,
      sellingPrice: 1599,
      discountPercent: 10,
      stock: 40,
      isFeatured: false,
      isActive: true,
    },
    {
      name: 'Blue Light Filter Glasses',
      slug: 'blue-light-filter-glasses',
      description: 'Specially designed to block harmful blue light from screens. Reduce eye strain and improve sleep quality.',
      brand: 'TechShield',
      categoryId: categories[3].id,
      purchasePrice: 499,
      sellingPrice: 999,
      discountPercent: 30,
      stock: 100,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Monthly Contact Lenses',
      slug: 'monthly-contact-lenses',
      description: 'Comfortable monthly disposable contact lenses with high oxygen permeability. Available in various powers.',
      brand: 'ClearView',
      categoryId: categories[2].id,
      purchasePrice: 299,
      sellingPrice: 699,
      discountPercent: 0,
      stock: 200,
      isFeatured: false,
      isActive: true,
    },
  ];

  for (const productData of products) {
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (!existing) {
      const product = await prisma.product.create({ data: productData });
      // Add placeholder images
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://picsum.photos/seed/${product.slug}/800/600`,
          altText: product.name,
          isPrimary: true,
        },
      });
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://picsum.photos/seed/${product.slug}-2/800/600`,
          altText: `${product.name} - side view`,
          isPrimary: false,
        },
      });

      // Add 360° images to the first product (Classic Aviator Frame)
      if (product.slug === 'classic-aviator-frame') {
        const images360 = [];
        for (let i = 0; i < 12; i++) {
          images360.push(`https://picsum.photos/seed/${product.slug}-360-${i}/800/800`);
        }
        await prisma.product.update({
          where: { id: product.id },
          data: { images360 },
        });
      }
    }
  }

  console.log('Seeding complete!');
  console.log('Admin: admin@eyewear.com / admin123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
