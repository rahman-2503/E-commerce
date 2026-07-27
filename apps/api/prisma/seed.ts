import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🗑️  Cleaning existing products...');
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('🌱 Seeding database with men\'s fashion...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@storepulse.com' },
    update: { password: hashedPassword, name: 'Admin', isVerified: true },
    create: {
      email: 'admin@storepulse.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@storepulse.com' },
    update: { password: hashedPassword, name: 'Test User', isVerified: true },
    create: {
      email: 'user@storepulse.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'USER',
      isVerified: true,
    },
  });

  const categoryData = [
    { name: 'Men\'s T-Shirts', slug: 'mens-tshirts', description: 'T-shirts, polos, and athletic tees' },
    { name: 'Men\'s Shirts', slug: 'mens-shirts', description: 'Formal and casual shirts' },
    { name: 'Men\'s Pants & Trousers', slug: 'mens-pants', description: 'Jeans, chinos, trousers, and track pants' },
    { name: 'Men\'s Shorts', slug: 'mens-shorts', description: 'Casual and sports shorts' },
    { name: 'Men\'s Innerwear', slug: 'mens-innerwear', description: 'Vests, briefs, and boxers' },
    { name: 'Men\'s Outerwear', slug: 'mens-outerwear', description: 'Jackets, sweaters, and hoodies' },
    { name: 'Men\'s Watches', slug: 'mens-watches', description: 'Premium watches for every occasion' },
    { name: 'Men\'s Eyewear', slug: 'mens-eyewear', description: 'Sunglasses, goggles, and reading glasses' },
    { name: 'Men\'s Shoes', slug: 'mens-shoes', description: 'Sneakers, loafers, boots, and formal shoes' },
    { name: 'Men\'s Accessories', slug: 'mens-accessories', description: 'Belts, wallets, bags, and more' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created.id;
  }

  const products = [
    {
      name: 'Classic Oxford Shirt',
      slug: 'classic-oxford-shirt',
      brand: 'Heritage & Co.',
      price: 2499,
      categorySlug: 'mens-shirts',
      tags: ['shirt', 'formal', 'oxford', 'cotton'],
      images: [
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736e10?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'S - White', attributes: { size: 'S', color: 'White' }, stock: 15 },
        { name: 'M - White', attributes: { size: 'M', color: 'White' }, stock: 25 },
        { name: 'L - White', attributes: { size: 'L', color: 'White' }, stock: 30 },
        { name: 'XL - White', attributes: { size: 'XL', color: 'White' }, stock: 20 },
        { name: 'M - Blue', attributes: { size: 'M', color: 'Blue' }, stock: 18 },
        { name: 'L - Blue', attributes: { size: 'L', color: 'Blue' }, stock: 22 },
      ],
    },
    {
      name: 'Slim Fit Chinos',
      slug: 'slim-fit-chinos',
      brand: 'Urban Tailor',
      price: 1999,
      categorySlug: 'mens-pants',
      tags: ['pants', 'chinos', 'cotton', 'casual'],
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: '30 - Khaki', attributes: { size: '30', color: 'Khaki' }, stock: 20 },
        { name: '32 - Khaki', attributes: { size: '32', color: 'Khaki' }, stock: 35 },
        { name: '34 - Khaki', attributes: { size: '34', color: 'Khaki' }, stock: 25 },
        { name: '32 - Navy', attributes: { size: '32', color: 'Navy' }, stock: 28 },
        { name: '34 - Navy', attributes: { size: '34', color: 'Navy' }, stock: 22 },
      ],
    },
    {
      name: 'Premium Denim Jeans',
      slug: 'premium-denim-jeans',
      brand: 'Rugged & Raw',
      price: 2999,
      categorySlug: 'mens-pants',
      tags: ['pants', 'jeans', 'denim', 'casual'],
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: '30 - Dark Blue', attributes: { size: '30', color: 'Dark Blue' }, stock: 18 },
        { name: '32 - Dark Blue', attributes: { size: '32', color: 'Dark Blue' }, stock: 30 },
        { name: '34 - Dark Blue', attributes: { size: '34', color: 'Dark Blue' }, stock: 25 },
        { name: '32 - Light Wash', attributes: { size: '32', color: 'Light Wash' }, stock: 20 },
        { name: '34 - Black', attributes: { size: '34', color: 'Black' }, stock: 15 },
      ],
    },
    {
      name: 'Casual Linen Shorts',
      slug: 'casual-linen-shorts',
      brand: 'Summer Vibe',
      price: 1299,
      categorySlug: 'mens-shorts',
      tags: ['shorts', 'linen', 'summer', 'casual'],
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1565693413572-8be9de2e782e?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'M - Beige', attributes: { size: 'M', color: 'Beige' }, stock: 25 },
        { name: 'L - Beige', attributes: { size: 'L', color: 'Beige' }, stock: 30 },
        { name: 'XL - Beige', attributes: { size: 'XL', color: 'Beige' }, stock: 20 },
        { name: 'M - Navy', attributes: { size: 'M', color: 'Navy' }, stock: 22 },
        { name: 'L - Navy', attributes: { size: 'L', color: 'Navy' }, stock: 28 },
      ],
    },
    {
      name: 'Athletic Performance Tee',
      slug: 'athletic-performance-tee',
      brand: 'SportFlex',
      price: 999,
      categorySlug: 'mens-tshirts',
      tags: ['t-shirt', 'athletic', 'gym', 'performance'],
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1603344797033-c0e70f7be5ac?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'M - Black', attributes: { size: 'M', color: 'Black' }, stock: 40 },
        { name: 'L - Black', attributes: { size: 'L', color: 'Black' }, stock: 50 },
        { name: 'XL - Black', attributes: { size: 'XL', color: 'Black' }, stock: 35 },
        { name: 'M - White', attributes: { size: 'M', color: 'White' }, stock: 38 },
        { name: 'L - White', attributes: { size: 'L', color: 'White' }, stock: 45 },
        { name: 'L - Gray', attributes: { size: 'L', color: 'Gray' }, stock: 30 },
      ],
    },
    {
      name: 'Lightweight Bomber Jacket',
      slug: 'lightweight-bomber-jacket',
      brand: 'Apex Urban',
      price: 3999,
      categorySlug: 'mens-outerwear',
      tags: ['jacket', 'bomber', 'outerwear', 'casual'],
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544923246-77307dd270b7?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'M - Olive', attributes: { size: 'M', color: 'Olive' }, stock: 12 },
        { name: 'L - Olive', attributes: { size: 'L', color: 'Olive' }, stock: 18 },
        { name: 'XL - Olive', attributes: { size: 'XL', color: 'Olive' }, stock: 10 },
        { name: 'M - Black', attributes: { size: 'M', color: 'Black' }, stock: 15 },
        { name: 'L - Black', attributes: { size: 'L', color: 'Black' }, stock: 20 },
      ],
    },
    {
      name: 'Merino Wool Sweater',
      slug: 'merino-wool-sweater',
      brand: 'LuxKnit',
      price: 3499,
      categorySlug: 'mens-outerwear',
      tags: ['sweater', 'wool', 'winter', 'formal'],
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1614975059407-efe87ed1a4f7?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'M - Charcoal', attributes: { size: 'M', color: 'Charcoal' }, stock: 15 },
        { name: 'L - Charcoal', attributes: { size: 'L', color: 'Charcoal' }, stock: 22 },
        { name: 'XL - Charcoal', attributes: { size: 'XL', color: 'Charcoal' }, stock: 12 },
        { name: 'M - Navy', attributes: { size: 'M', color: 'Navy' }, stock: 18 },
        { name: 'L - Navy', attributes: { size: 'L', color: 'Navy' }, stock: 20 },
      ],
    },
    {
      name: 'Cargo Joggers',
      slug: 'cargo-joggers',
      brand: 'StreetNinja',
      price: 1799,
      categorySlug: 'mens-pants',
      tags: ['pants', 'joggers', 'cargo', 'casual'],
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'M - Black', attributes: { size: 'M', color: 'Black' }, stock: 30 },
        { name: 'L - Black', attributes: { size: 'L', color: 'Black' }, stock: 40 },
        { name: 'XL - Black', attributes: { size: 'XL', color: 'Black' }, stock: 25 },
        { name: 'L - Gray', attributes: { size: 'L', color: 'Gray' }, stock: 35 },
        { name: 'XL - Olive', attributes: { size: 'XL', color: 'Olive' }, stock: 20 },
      ],
    },
    {
      name: 'Classic Fit Polo',
      slug: 'classic-fit-polo',
      brand: 'Prestige Casuals',
      price: 1599,
      categorySlug: 'mens-tshirts',
      tags: ['polo', 't-shirt', 'casual', 'cotton'],
      images: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'M - White', attributes: { size: 'M', color: 'White' }, stock: 35 },
        { name: 'L - White', attributes: { size: 'L', color: 'White' }, stock: 45 },
        { name: 'XL - White', attributes: { size: 'XL', color: 'White' }, stock: 25 },
        { name: 'M - Black', attributes: { size: 'M', color: 'Black' }, stock: 30 },
        { name: 'L - Black', attributes: { size: 'L', color: 'Black' }, stock: 40 },
        { name: 'L - Navy', attributes: { size: 'L', color: 'Navy' }, stock: 35 },
      ],
    },
    {
      name: 'Ultra Comfort Sneakers',
      slug: 'ultra-comfort-sneakers',
      brand: 'StepSync',
      price: 4999,
      categorySlug: 'mens-shoes',
      tags: ['shoes', 'sneakers', 'casual', 'sports'],
      images: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: '8 - White', attributes: { size: '8', color: 'White' }, stock: 15 },
        { name: '9 - White', attributes: { size: '9', color: 'White' }, stock: 25 },
        { name: '10 - White', attributes: { size: '10', color: 'White' }, stock: 30 },
        { name: '9 - Black', attributes: { size: '9', color: 'Black' }, stock: 22 },
        { name: '10 - Black', attributes: { size: '10', color: 'Black' }, stock: 28 },
        { name: '11 - Black', attributes: { size: '11', color: 'Black' }, stock: 18 },
      ],
    },
    {
      name: 'Tan Leather Loafers',
      slug: 'tan-leather-loafers',
      brand: 'Brogue & Co.',
      price: 5999,
      categorySlug: 'mens-shoes',
      tags: ['shoes', 'loafers', 'leather', 'formal'],
      images: [
        'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: '8 - Tan', attributes: { size: '8', color: 'Tan' }, stock: 10 },
        { name: '9 - Tan', attributes: { size: '9', color: 'Tan' }, stock: 18 },
        { name: '10 - Tan', attributes: { size: '10', color: 'Tan' }, stock: 20 },
        { name: '9 - Brown', attributes: { size: '9', color: 'Brown' }, stock: 15 },
        { name: '10 - Brown', attributes: { size: '10', color: 'Brown' }, stock: 18 },
      ],
    },
    {
      name: 'Trail Running Shoes',
      slug: 'trail-running-shoes',
      brand: 'StepSync',
      price: 6999,
      categorySlug: 'mens-shoes',
      tags: ['shoes', 'running', 'trail', 'sports'],
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: '8 - Blue', attributes: { size: '8', color: 'Blue' }, stock: 12 },
        { name: '9 - Blue', attributes: { size: '9', color: 'Blue' }, stock: 20 },
        { name: '10 - Blue', attributes: { size: '10', color: 'Blue' }, stock: 25 },
        { name: '9 - Black', attributes: { size: '9', color: 'Black' }, stock: 18 },
        { name: '10 - Black', attributes: { size: '10', color: 'Black' }, stock: 22 },
        { name: '11 - Black', attributes: { size: '11', color: 'Black' }, stock: 14 },
      ],
    },
    {
      name: 'Classic Dress Shoes',
      slug: 'classic-dress-shoes',
      brand: 'Brogue & Co.',
      price: 7999,
      categorySlug: 'mens-shoes',
      tags: ['shoes', 'dress', 'formal', 'leather'],
      images: [
        'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: '8 - Black', attributes: { size: '8', color: 'Black' }, stock: 10 },
        { name: '9 - Black', attributes: { size: '9', color: 'Black' }, stock: 18 },
        { name: '10 - Black', attributes: { size: '10', color: 'Black' }, stock: 22 },
        { name: '9 - Brown', attributes: { size: '9', color: 'Brown' }, stock: 15 },
        { name: '10 - Brown', attributes: { size: '10', color: 'Brown' }, stock: 20 },
      ],
    },
    {
      name: 'Canvas Slip-Ons',
      slug: 'canvas-slip-ons',
      brand: 'Coastal Walk',
      price: 2499,
      categorySlug: 'mens-shoes',
      tags: ['shoes', 'slip-ons', 'canvas', 'casual'],
      images: [
        'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: '8 - Navy', attributes: { size: '8', color: 'Navy' }, stock: 18 },
        { name: '9 - Navy', attributes: { size: '9', color: 'Navy' }, stock: 25 },
        { name: '10 - Navy', attributes: { size: '10', color: 'Navy' }, stock: 30 },
        { name: '9 - White', attributes: { size: '9', color: 'White' }, stock: 22 },
        { name: '10 - White', attributes: { size: '10', color: 'White' }, stock: 28 },
      ],
    },
    {
      name: 'ChronoGraph Automatic Watch',
      slug: 'chronograph-automatic-watch',
      brand: 'Timeless Gear',
      price: 12999,
      categorySlug: 'mens-watches',
      tags: ['watch', 'chronograph', 'luxury', 'accessories'],
      images: [
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1548171915-e4a28b63e5ec?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1526045431048-8572a4d0a08d?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'Silver Dial - Steel Bracelet', attributes: { color: 'Silver', style: 'Steel Bracelet' }, stock: 8 },
        { name: 'Silver Dial - Leather Strap', attributes: { color: 'Silver', style: 'Leather Strap' }, stock: 12 },
        { name: 'Black Dial - Steel Bracelet', attributes: { color: 'Black', style: 'Steel Bracelet' }, stock: 10 },
        { name: 'Black Dial - Leather Strap', attributes: { color: 'Black', style: 'Leather Strap' }, stock: 14 },
      ],
    },
    {
      name: 'Minimalist Quartz Watch',
      slug: 'minimalist-quartz-watch',
      brand: 'Nordic Simplicity',
      price: 4499,
      categorySlug: 'mens-watches',
      tags: ['watch', 'minimalist', 'quartz', 'accessories'],
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1548171915-e4a28b63e5ec?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'Rose Gold - Mesh Strap', attributes: { color: 'Rose Gold', style: 'Mesh Strap' }, stock: 20 },
        { name: 'Silver - Mesh Strap', attributes: { color: 'Silver', style: 'Mesh Strap' }, stock: 25 },
        { name: 'Black - Leather Strap', attributes: { color: 'Black', style: 'Leather Strap' }, stock: 18 },
        { name: 'Silver - Leather Strap', attributes: { color: 'Silver', style: 'Leather Strap' }, stock: 22 },
      ],
    },
    {
      name: 'Aviator Sunglasses',
      slug: 'aviator-sunglasses',
      brand: 'Vista Optics',
      price: 2999,
      categorySlug: 'mens-eyewear',
      tags: ['sunglasses', 'aviator', 'accessories', 'UV'],
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1577803645773-f964db09661d?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'Gold Frame - Green Lens', attributes: { frame: 'Gold', lens: 'Green' }, stock: 25 },
        { name: 'Gold Frame - Brown Lens', attributes: { frame: 'Gold', lens: 'Brown' }, stock: 20 },
        { name: 'Silver Frame - Blue Lens', attributes: { frame: 'Silver', lens: 'Blue' }, stock: 18 },
        { name: 'Black Frame - Gray Lens', attributes: { frame: 'Black', lens: 'Gray' }, stock: 22 },
      ],
    },
    {
      name: 'Sport Wrap Sunglasses',
      slug: 'sport-wrap-sunglasses',
      brand: 'Vista Optics',
      price: 1999,
      categorySlug: 'mens-eyewear',
      tags: ['sunglasses', 'sport', 'wrap', 'UV'],
      images: [
        'https://images.unsplash.com/photo-1577803645773-f964db09661d?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'Black Frame - Black Lens', attributes: { frame: 'Black', lens: 'Black' }, stock: 30 },
        { name: 'Black Frame - Blue Mirror', attributes: { frame: 'Black', lens: 'Blue Mirror' }, stock: 25 },
        { name: 'Matte Black - Red Lens', attributes: { frame: 'Matte Black', lens: 'Red' }, stock: 20 },
      ],
    },
    {
      name: 'Genuine Leather Belt',
      slug: 'genuine-leather-belt',
      brand: 'Heritage & Co.',
      price: 1499,
      categorySlug: 'mens-accessories',
      tags: ['belt', 'leather', 'accessories', 'formal'],
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552010099-5dc86fcfaa38?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: '32 - Black', attributes: { size: '32', color: 'Black' }, stock: 30 },
        { name: '34 - Black', attributes: { size: '34', color: 'Black' }, stock: 35 },
        { name: '36 - Black', attributes: { size: '36', color: 'Black' }, stock: 25 },
        { name: '32 - Brown', attributes: { size: '32', color: 'Brown' }, stock: 28 },
        { name: '34 - Brown', attributes: { size: '34', color: 'Brown' }, stock: 32 },
        { name: '36 - Brown', attributes: { size: '36', color: 'Brown' }, stock: 22 },
      ],
    },
    {
      name: 'Slim Bifold Wallet',
      slug: 'slim-bifold-wallet',
      brand: 'LeatherCraft',
      price: 999,
      categorySlug: 'mens-accessories',
      tags: ['wallet', 'leather', 'slim', 'accessories'],
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'Black - Standard', attributes: { color: 'Black', style: 'Standard' }, stock: 40 },
        { name: 'Brown - Standard', attributes: { color: 'Brown', style: 'Standard' }, stock: 35 },
        { name: 'Black - RFID', attributes: { color: 'Black', style: 'RFID' }, stock: 25 },
        { name: 'Tan - Standard', attributes: { color: 'Tan', style: 'Standard' }, stock: 30 },
      ],
    },
    {
      name: 'Canvas Travel Backpack',
      slug: 'canvas-travel-backpack',
      brand: 'Urban Nomad',
      price: 2999,
      categorySlug: 'mens-accessories',
      tags: ['backpack', 'canvas', 'travel', 'accessories'],
      images: [
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'Brown Canvas - 25L', attributes: { color: 'Brown', capacity: '25L' }, stock: 15 },
        { name: 'Brown Canvas - 35L', attributes: { color: 'Brown', capacity: '35L' }, stock: 20 },
        { name: 'Black Canvas - 25L', attributes: { color: 'Black', capacity: '25L' }, stock: 18 },
        { name: 'Black Canvas - 35L', attributes: { color: 'Black', capacity: '35L' }, stock: 22 },
        { name: 'Olive Canvas - 35L', attributes: { color: 'Olive', capacity: '35L' }, stock: 16 },
      ],
    },
    {
      name: 'Stainless Steel Cufflinks',
      slug: 'stainless-steel-cufflinks',
      brand: 'Gentleman\'s Choice',
      price: 799,
      categorySlug: 'mens-accessories',
      tags: ['cufflinks', 'formal', 'accessories', 'steel'],
      images: [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
      ],
      variants: [
        { name: 'Silver - Round', attributes: { color: 'Silver', shape: 'Round' }, stock: 25 },
        { name: 'Silver - Square', attributes: { color: 'Silver', shape: 'Square' }, stock: 20 },
        { name: 'Gold - Round', attributes: { color: 'Gold', shape: 'Round' }, stock: 15 },
        { name: 'Black Enamel - Round', attributes: { color: 'Black Enamel', shape: 'Round' }, stock: 18 },
      ],
    },
  ];

  let createdCount = 0;
  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: `Premium ${p.name.toLowerCase()} by ${p.brand}. Crafted with high-quality materials for lasting comfort and style. Perfect for the modern gentleman.`,
        brand: p.brand,
        basePrice: p.price,
        images: p.images,
        rating: parseFloat((4 + Math.random()).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 80) + 15,
        isFeatured: true,
        categoryId: categories[p.categorySlug],
        tags: p.tags,
        variants: {
          create: p.variants.map((v, idx) => ({
            name: v.name,
            sku: `${p.slug.toUpperCase().replace(/-/g, '_')}_${idx + 1}`,
            price: p.price + (v.attributes.color?.includes('Gold') || v.name.includes('RFID') || v.name.includes('Leather Strap') ? 500 : 0),
            stock: v.stock,
            attributes: v.attributes,
            images: [p.images[0]],
          })),
        },
      },
    });
    createdCount++;
    console.log(`  ✓ ${p.name}`);
  }

  const couponData = [
    { code: 'WELCOME10', type: 'PERCENTAGE' as const, value: 10, minOrderValue: 500, maxUses: 100, usedCount: 15 },
    { code: 'FLAT200', type: 'FLAT' as const, value: 200, minOrderValue: 999, maxUses: 50, usedCount: 8 },
    { code: 'FREESHIP', type: 'FLAT' as const, value: 99, minOrderValue: 499, maxUses: 200, usedCount: 42 },
    { code: 'SUMMER25', type: 'PERCENTAGE' as const, value: 25, minOrderValue: 1500, maxUses: 30, usedCount: 5 },
    { code: 'HALFOFF', type: 'PERCENTAGE' as const, value: 50, minOrderValue: 2000, maxUses: 20, usedCount: 0 },
    { code: 'SAVE35', type: 'PERCENTAGE' as const, value: 35, minOrderValue: 1000, maxUses: 30, usedCount: 0 },
  ];

  for (const coupon of couponData) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: { ...coupon, expiresAt: new Date('2026-12-31'), isActive: true },
    });
  }

  console.log(`\n✅ Seed complete! Created ${createdCount} products`);
  console.log('   Admin: admin@storepulse.com / password123');
  console.log('   User:  user@storepulse.com / password123');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
