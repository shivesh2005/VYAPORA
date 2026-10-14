import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import {
  User,
  Store,
  Product,
  Category,
  Coupon,
  SubscriptionPlan,
  Subscription,
  Order,
  Review,
} from '../models';
import { seedPlans, seedCategories, seedCoupons } from './seedData';

export const runSeed = async () => {
  console.log('🌱 Starting NEXORA Cloud Database Seeder...');

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Store.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Coupon.deleteMany({}),
    SubscriptionPlan.deleteMany({}),
    Subscription.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('🧹 Purged obsolete records.');

  // 2. Seed Subscription Plans
  const plans = await SubscriptionPlan.insertMany(seedPlans);
  const starterPlan = plans.find((p) => p.name === 'STARTER')!;
  const growthPlan = plans.find((p) => p.name === 'GROWTH')!;
  const scalePlan = plans.find((p) => p.name === 'SCALE')!;
  console.log('✅ Seeded 3 SaaS Subscription Plans.');

  // 3. Seed Categories
  const categories = await Category.insertMany(seedCategories);
  console.log(`✅ Seeded ${categories.length} Product Categories.`);

  // 4. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await User.create({
    name: 'Nexora Platform Admin',
    email: 'admin@nexora.com',
    passwordHash,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  });

  const seller1 = await User.create({
    name: 'Aetherial Tech Labs',
    email: 'seller@nexora.com',
    passwordHash,
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  });

  const seller2 = await User.create({
    name: 'Vanguard Audio & Lifestyle',
    email: 'techseller@nexora.com',
    passwordHash,
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80',
  });

  const customer1 = await User.create({
    name: 'Rohan Sharma',
    email: 'customer@nexora.com',
    passwordHash,
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  });

  const customer2 = await User.create({
    name: 'Priya Patel',
    email: 'priya@example.com',
    passwordHash,
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  });

  // Vyapora & Ejan Seva Branded Demo Accounts
  await User.create([
    {
      name: 'Vyapora Platform Admin (व्यापोरा)',
      email: 'admin@vyapora.com',
      passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
    {
      name: 'Vyapora Verified Merchant',
      email: 'seller@vyapora.com',
      passwordHash,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
    {
      name: 'Aarav Verma (व्यापोरा ग्राहक)',
      email: 'customer@vyapora.com',
      passwordHash,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    },
    {
      name: 'Ejan Seva Admin (ईजन सेवा)',
      email: 'admin@ejanseva.com',
      passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
    {
      name: 'Ejan Seva Verified Merchant',
      email: 'seller@ejanseva.com',
      passwordHash,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
    {
      name: 'Aarav Verma (ईजन सेवा ग्राहक)',
      email: 'customer@ejanseva.com',
      passwordHash,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    },
  ]);
  console.log('✅ Seeded Users: Vyapora Admin, Verified Sellers, and Marketplace Customers.');

  // 5. Seed Stores
  const store1 = await Store.create({
    sellerId: seller1._id,
    storeName: 'Aetherial Cloud Tech',
    slug: 'aetherial-cloud-tech',
    description: 'Pioneering minimalist next-gen computing, ergonomic gear, and smart living electronics.',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    brandAccentColor: '#7C3AED',
    contactEmail: 'contact@aetherial.cloud',
    contactPhone: '+91 98765 43210',
    layoutSettings: {
      theme: 'modern',
      showBanner: true,
      featuredTagline: 'Engineering the future of daily desktop computing.',
      productGridColumns: 4,
    },
    isApproved: true,
    totalSales: 184500,
  });

  const store2 = await Store.create({
    sellerId: seller2._id,
    storeName: 'Vanguard Audio Lab',
    slug: 'vanguard-audio-lab',
    description: 'Precision acoustic engineering, studio monitor grade wireless headphones and audiophile gear.',
    logoUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=256&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    brandAccentColor: '#06B6D4',
    contactEmail: 'support@vanguardaudio.io',
    contactPhone: '+91 99887 76655',
    layoutSettings: {
      theme: 'bold',
      showBanner: true,
      featuredTagline: 'Pure lossless acoustics for producers and music lovers.',
      productGridColumns: 4,
    },
    isApproved: true,
    totalSales: 246800,
  });

  // 6. Seed Subscriptions
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await Subscription.create({
    sellerId: seller1._id,
    storeId: store1._id,
    planId: growthPlan._id,
    status: 'active',
    currentPeriodEnd: nextMonth,
    usage: { productsCount: 14, aiRequestsThisMonth: 42 },
  });

  await Subscription.create({
    sellerId: seller2._id,
    storeId: store2._id,
    planId: scalePlan._id,
    status: 'active',
    currentPeriodEnd: nextMonth,
    usage: { productsCount: 12, aiRequestsThisMonth: 118 },
  });
  console.log('✅ Seeded Active SaaS Merchant Subscriptions (Growth & Scale).');

  // 7. Seed 26 Realistic Products
  const productsRaw = [
    // Audio Products (6)
    {
      title: 'Vanguard Horizon Pro Wireless ANC Headphones',
      slug: 'vanguard-horizon-pro-wireless-anc-headphones',
      description: 'Studio-grade 45mm neodymium drivers, dual hybrid active noise cancellation up to 42dB, ultra-plush memory foam earpads, and 60-hour continuous battery life with fast Type-C charging.',
      brand: 'Vanguard',
      category: 'Audio & Sound',
      subcategory: 'Over-Ear',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      ],
      price: 6499,
      compareAtPrice: 9999,
      discountBadge: '35% OFF',
      sku: 'VAN-ANC-001',
      stock: 45,
      variants: [{ name: 'Color', options: ['Matte Black', 'Starlight Silver', 'Deep Navy'] }],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.8,
      numReviews: 128,
      tags: ['audio', 'headphones', 'anc', 'wireless', 'bluetooth', 'bestseller'],
      isFeatured: true,
    },
    {
      title: 'SonicPulse AirFlow True Wireless Earbuds',
      slug: 'sonicpulse-airflow-true-wireless-earbuds',
      description: 'Ultra-lightweight IPX7 waterproof buds with environmental noise cancellation, low latency gaming mode (38ms), and wireless Qi charging cradle.',
      brand: 'SonicPulse',
      category: 'Audio & Sound',
      subcategory: 'In-Ear',
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80',
      ],
      price: 2499,
      compareAtPrice: 3999,
      discountBadge: '38% OFF',
      sku: 'SON-AIR-002',
      stock: 80,
      variants: [{ name: 'Color', options: ['Pure White', 'Obsidian Black'] }],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.6,
      numReviews: 94,
      tags: ['audio', 'earbuds', 'tws', 'waterproof', 'under-3000'],
      isFeatured: true,
    },
    {
      title: 'AuraStudio Retro Bluetooth Desktop Speaker',
      slug: 'aurastudio-retro-bluetooth-desktop-speaker',
      description: 'Crafted with genuine walnut wood housing, brass-accented control knobs, dual subwoofers delivering punchy 40W stereo sound, and Bluetooth 5.3 + Aux connectivity.',
      brand: 'AuraStudio',
      category: 'Audio & Sound',
      subcategory: 'Speakers',
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      ],
      price: 4999,
      compareAtPrice: 6999,
      discountBadge: '28% OFF',
      sku: 'AUR-SPK-003',
      stock: 30,
      variants: [{ name: 'Finish', options: ['Walnut Brown', 'Ash Black'] }],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.7,
      numReviews: 62,
      tags: ['audio', 'speaker', 'vintage', 'bluetooth', 'desktop'],
      isFeatured: false,
    },
    {
      title: 'StudioTrack USB Condenser Podcast Microphone',
      slug: 'studiotrack-usb-condenser-podcast-microphone',
      description: 'Zero-latency 192kHz/24-bit cardioid condenser mic with built-in pop filter, touch-mute sensor, RGB gain indicator, and shock mount for streamers and podcasters.',
      brand: 'StudioTrack',
      category: 'Audio & Sound',
      subcategory: 'Microphones',
      images: [
        'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
      ],
      price: 3299,
      compareAtPrice: 4599,
      discountBadge: '28% OFF',
      sku: 'MIC-USB-004',
      stock: 24,
      variants: [{ name: 'Color', options: ['Matte Black', 'Frost White'] }],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.9,
      numReviews: 76,
      tags: ['audio', 'microphone', 'podcast', 'streaming', 'studio'],
      isFeatured: true,
    },
    {
      title: 'PulseBass Bass-Boosted Portable Wireless Speaker',
      slug: 'pulsebass-bass-boosted-portable-wireless-speaker',
      description: 'Rugged outdoor cylindrical speaker with 360-degree bass radiator, IP67 dust/water resistance, and built-in power bank for phone charging on the go.',
      brand: 'PulseBass',
      category: 'Audio & Sound',
      subcategory: 'Portable',
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
      ],
      price: 1899,
      compareAtPrice: 2999,
      discountBadge: '36% OFF',
      sku: 'PUL-BSS-005',
      stock: 65,
      variants: [{ name: 'Color', options: ['Teal Blue', 'Camouflage', 'Carbon Black'] }],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.4,
      numReviews: 48,
      tags: ['audio', 'speaker', 'outdoor', 'waterproof', 'under-3000'],
      isFeatured: false,
    },
    {
      title: 'EchoStream Lossless DAC & Headphone Amplifier',
      slug: 'echostream-lossless-dac-headphone-amplifier',
      description: 'High-resolution ESS Sabre ES9038Q2M portable DAC amplifier supporting DSD512 and 32bit/768kHz decoded playback for audiophile in-ear monitors.',
      brand: 'EchoStream',
      category: 'Audio & Sound',
      subcategory: 'DAC',
      images: [
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      ],
      price: 5499,
      compareAtPrice: 7499,
      discountBadge: '26% OFF',
      sku: 'ECH-DAC-006',
      stock: 18,
      variants: [{ name: 'Jack', options: ['3.5mm + 4.4mm Balanced'] }],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.7,
      numReviews: 31,
      tags: ['audio', 'dac', 'audiophile', 'hifi'],
      isFeatured: false,
    },

    // Electronics & Computing (8)
    {
      title: 'Aetherial ApexBook 16 M3 Ultra Thin Laptop',
      slug: 'aetherial-apexbook-16-m3-ultra-thin-laptop',
      description: 'Aviation-grade unibody aluminum chassis, 16-inch 3.2K 120Hz Mini-LED display, 32GB LPDDR5X RAM, 1TB Gen4 NVMe SSD, and 18-hour continuous productivity battery life.',
      brand: 'Aetherial',
      category: 'Electronics',
      subcategory: 'Laptops',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      ],
      price: 84999,
      compareAtPrice: 99999,
      discountBadge: '₹15,000 OFF',
      sku: 'AET-LAP-001',
      stock: 15,
      variants: [
        { name: 'Memory', options: ['16GB / 512GB SSD', '32GB / 1TB SSD'] },
        { name: 'Color', options: ['Space Gray', 'Silver Metallic'] },
      ],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.9,
      numReviews: 43,
      tags: ['electronics', 'laptop', 'computing', 'premium', 'ultrabook'],
      isFeatured: true,
    },
    {
      title: 'NexPad Pro 12.9 Inch OLED Creative Tablet',
      slug: 'nexpad-pro-12-9-inch-oled-creative-tablet',
      description: 'Ultra-thin 5.5mm slate featuring a tandem OLED 120Hz display, pressure-sensitive 4096 level stylus support, quad speakers, and PC-mode desktop windowing.',
      brand: 'Nexora Cloud Tech',
      category: 'Electronics',
      subcategory: 'Tablets',
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
      ],
      price: 42999,
      compareAtPrice: 51999,
      discountBadge: '17% OFF',
      sku: 'NEX-TAB-002',
      stock: 22,
      variants: [{ name: 'Storage', options: ['128GB Wi-Fi', '256GB Wi-Fi + 5G'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.8,
      numReviews: 57,
      tags: ['electronics', 'tablet', 'oled', 'creativity', 'stylus'],
      isFeatured: true,
    },
    {
      title: 'Lumix Mechanical 75% Wireless Hot-Swap Keyboard',
      slug: 'lumix-mechanical-75-wireless-hot-swap-keyboard',
      description: 'Gasket-mounted mechanical keyboard with pre-lubed Gateron Pro switches, south-facing per-key RGB, sound-dampening silicone foam, and tri-mode connectivity (2.4G/BT/USB).',
      brand: 'Lumix Keys',
      category: 'Electronics',
      subcategory: 'Keyboards',
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
      ],
      price: 5299,
      compareAtPrice: 7499,
      discountBadge: '29% OFF',
      sku: 'LUM-KEY-003',
      stock: 40,
      variants: [
        { name: 'Switch', options: ['Tactile Brown', 'Linear Red', 'Clicky Blue'] },
        { name: 'Colorway', options: ['Cyberpunk Violet', 'Retro Chalk White'] },
      ],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.8,
      numReviews: 110,
      tags: ['electronics', 'keyboard', 'mechanical', 'gaming', 'rgb'],
      isFeatured: true,
    },
    {
      title: 'HyperGlide Ultra-Lightweight Wireless Gaming Mouse',
      slug: 'hyperglide-ultra-lightweight-wireless-gaming-mouse',
      description: 'Featherweight 49-gram magnesium alloy chassis, 30,000 DPI PAW3395 optical sensor, 4000Hz polling rate receiver, and PTFE glide feet for effortless flick tracking.',
      brand: 'Aetherial',
      category: 'Electronics',
      subcategory: 'Mice',
      images: [
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      ],
      price: 3899,
      compareAtPrice: 5499,
      discountBadge: '29% OFF',
      sku: 'HYP-MOU-004',
      stock: 55,
      variants: [{ name: 'Color', options: ['Matte White', 'Stealth Black'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.7,
      numReviews: 82,
      tags: ['electronics', 'mouse', 'gaming', 'wireless', 'esports'],
      isFeatured: false,
    },
    {
      title: 'AuraView 27-inch 4K UHD IPS Designer Monitor',
      slug: 'auraview-27-inch-4k-uhd-ips-designer-monitor',
      description: 'Factory-calibrated Delta E < 1 color accuracy, 99% DCI-P3 gamut, 90W USB-C single cable power delivery, and fully ergonomic pivot/tilt/height adjustable stand.',
      brand: 'AuraView',
      category: 'Electronics',
      subcategory: 'Monitors',
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      ],
      price: 28999,
      compareAtPrice: 34999,
      discountBadge: '17% OFF',
      sku: 'AUR-MON-005',
      stock: 16,
      variants: [{ name: 'Stand', options: ['Ergo Stand Included', 'VESA Arm Mount'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.8,
      numReviews: 39,
      tags: ['electronics', 'monitor', '4k', 'display', 'designer'],
      isFeatured: true,
    },
    {
      title: 'VoltCharge 140W GaN 4-Port Fast Desktop Charger',
      slug: 'voltcharge-140w-gan-4-port-fast-desktop-charger',
      description: 'Gallium Nitride (GaN III) high-efficiency charger with 3x USB-C PD 3.1 and 1x USB-A ports. Safely fast-charges a 16-inch laptop, tablet, and smartphone concurrently.',
      brand: 'VoltCharge',
      category: 'Electronics',
      subcategory: 'Chargers',
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      ],
      price: 2999,
      compareAtPrice: 4299,
      discountBadge: '30% OFF',
      sku: 'VOL-CHG-006',
      stock: 75,
      variants: [{ name: 'Color', options: ['Space Gray', 'Ceramic White'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.6,
      numReviews: 95,
      tags: ['electronics', 'charger', 'gan', 'fast-charging', 'under-3000'],
      isFeatured: false,
    },
    {
      title: 'OmniHub 10-in-1 Aluminum USB-C Expansion Dock',
      slug: 'omnihub-10-in-1-aluminum-usb-c-expansion-dock',
      description: 'Dual 4K@60Hz HDMI video out, Gigabit Ethernet, 100W PD passthrough, SD/TF UHS-II card readers, and 3x 10Gbps USB-C/A ports encased in heat-dissipating alloy.',
      brand: 'Aetherial',
      category: 'Electronics',
      subcategory: 'Hubs',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      ],
      price: 3499,
      compareAtPrice: 4999,
      discountBadge: '30% OFF',
      sku: 'OMN-HUB-007',
      stock: 38,
      variants: [{ name: 'Color', options: ['Space Gray'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.5,
      numReviews: 64,
      tags: ['electronics', 'hub', 'dock', 'usbc', 'accessories'],
      isFeatured: false,
    },
    {
      title: 'NovaWatch Titanium Sapphire Smartwatch',
      slug: 'novawatch-titanium-sapphire-smartwatch',
      description: 'Aerospace-grade titanium casing, scratchproof sapphire glass, 1.43-inch AMOLED display with Always-On, continuous ECG/SpO2 health tracking, and 14-day battery life.',
      brand: 'NovaWear',
      category: 'Electronics',
      subcategory: 'Wearables',
      images: [
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      ],
      price: 11999,
      compareAtPrice: 15999,
      discountBadge: '25% OFF',
      sku: 'NOV-WAT-008',
      stock: 28,
      variants: [
        { name: 'Strap', options: ['Fluoroelastomer Sports', 'Italian Leather Brown'] },
      ],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.7,
      numReviews: 53,
      tags: ['electronics', 'smartwatch', 'wearables', 'fitness'],
      isFeatured: true,
    },

    // Fashion & Apparel (6)
    {
      title: 'Aura Minimal Heavyweight Cotton Oversized Tee',
      slug: 'aura-minimal-heavyweight-cotton-oversized-tee',
      description: '280 GSM combed organic ring-spun cotton with boxy drop-shoulder cut, reinforced ribbed collar that never sags, and pre-shrunk reactive dye garment wash.',
      brand: 'Aura Streetwear',
      category: 'Fashion & Apparel',
      subcategory: 'T-Shirts',
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      ],
      price: 1299,
      compareAtPrice: 1999,
      discountBadge: '35% OFF',
      sku: 'AUR-TEE-001',
      stock: 120,
      variants: [
        { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
        { name: 'Color', options: ['Washed Black', 'Bone White', 'Sage Green'] },
      ],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.7,
      numReviews: 184,
      tags: ['fashion', 'streetwear', 'tshirt', 'cotton', 'oversized'],
      isFeatured: true,
    },
    {
      title: 'Kitsune Urban Techwear Waterproof Bomber Jacket',
      slug: 'kitsune-urban-techwear-waterproof-bomber-jacket',
      description: 'Constructed from triple-layer Cordura nylon with DWR waterproof coating, Fidlock magnetic pocket closures, waterproof taped seams, and internal strap carry system.',
      brand: 'Kitsune Tech',
      category: 'Fashion & Apparel',
      subcategory: 'Jackets',
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      ],
      price: 4599,
      compareAtPrice: 6499,
      discountBadge: '29% OFF',
      sku: 'KIT-BOM-002',
      stock: 35,
      variants: [
        { name: 'Size', options: ['M', 'L', 'XL'] },
        { name: 'Color', options: ['Stealth Black', 'Olive Drab'] },
      ],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.8,
      numReviews: 72,
      tags: ['fashion', 'jacket', 'techwear', 'waterproof', 'outerwear'],
      isFeatured: true,
    },
    {
      title: 'Nomad Waxed Canvas Everyday Carry Backpack',
      slug: 'nomad-waxed-canvas-everyday-carry-backpack',
      description: 'Handcrafted 18oz water-repellent Scottish waxed canvas, full-grain vegetable tanned leather straps, dedicated suspended 16-inch laptop compartment, and luggage pass-through.',
      brand: 'Nomad Craft',
      category: 'Fashion & Apparel',
      subcategory: 'Bags',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      ],
      price: 3799,
      compareAtPrice: 5299,
      discountBadge: '28% OFF',
      sku: 'NOM-BAG-003',
      stock: 40,
      variants: [{ name: 'Color', options: ['Heritage Tan', 'Charcoal Smoke', 'Forest Pine'] }],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.9,
      numReviews: 91,
      tags: ['fashion', 'backpack', 'canvas', 'travel', 'leather'],
      isFeatured: false,
    },
    {
      title: 'Solstice Polarized Titanium Aviator Sunglasses',
      slug: 'solstice-polarized-titanium-aviator-sunglasses',
      description: 'Ultra-thin flex titanium memory wire frame with Category 3 TAC polarized lenses offering 100% UV400 protection and anti-reflective internal coating.',
      brand: 'Solstice Eyewear',
      category: 'Fashion & Apparel',
      subcategory: 'Eyewear',
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      ],
      price: 2199,
      compareAtPrice: 3499,
      discountBadge: '37% OFF',
      sku: 'SOL-SUN-004',
      stock: 60,
      variants: [{ name: 'Lens', options: ['Smoked Black', 'Sunset Amber Gold'] }],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.6,
      numReviews: 54,
      tags: ['fashion', 'sunglasses', 'polarized', 'eyewear'],
      isFeatured: false,
    },
    {
      title: 'Aerofit Performance Seamless Athletic Hoodie',
      slug: 'aerofit-performance-seamless-athletic-hoodie',
      description: 'Four-way stretch thermal knit with moisture-wicking capillary channels, ergonomic raglan sleeves, thumb loops, and hidden zip kangaroo pocket for running.',
      brand: 'Aerofit',
      category: 'Fashion & Apparel',
      subcategory: 'Activewear',
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      ],
      price: 2699,
      compareAtPrice: 3699,
      discountBadge: '27% OFF',
      sku: 'AER-HOD-005',
      stock: 50,
      variants: [
        { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
        { name: 'Color', options: ['Heather Grey', 'Midnight Navy'] },
      ],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.5,
      numReviews: 67,
      tags: ['fashion', 'hoodie', 'activewear', 'workout'],
      isFeatured: false,
    },
    {
      title: 'Terraform Minimalist RFID Slim Cardholder',
      slug: 'terraform-minimalist-rfid-slim-cardholder',
      description: 'Machined aircraft-grade 6061 anodized aluminum with expandable elastic band, holds up to 12 cards + cash clip, and dual RFID signal blocking shields.',
      brand: 'Terraform',
      category: 'Fashion & Apparel',
      subcategory: 'Wallets',
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      ],
      price: 1199,
      compareAtPrice: 1799,
      discountBadge: '33% OFF',
      sku: 'TER-WAL-006',
      stock: 90,
      variants: [{ name: 'Color', options: ['Matte Black', 'Gunmetal Grey', 'Rose Gold'] }],
      sellerId: seller2._id,
      storeId: store2._id,
      rating: 4.7,
      numReviews: 142,
      tags: ['fashion', 'wallet', 'minimal', 'edc', 'under-3000'],
      isFeatured: false,
    },

    // Smart Living & Workspace (6)
    {
      title: 'AuraDesk Solid Walnut Motorized Standing Desk',
      slug: 'auradesk-solid-walnut-motorized-standing-desk',
      description: 'Solid FSC-certified American walnut desktop (60x30 inch) with dual whisper-quiet electric motors, anti-collision sensor, and digital memory keypad.',
      brand: 'AuraDesk',
      category: 'Smart Living',
      subcategory: 'Desks',
      images: [
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
      ],
      price: 34999,
      compareAtPrice: 42999,
      discountBadge: '18% OFF',
      sku: 'AUR-DSK-001',
      stock: 12,
      variants: [{ name: 'Top Size', options: ['55x28 inch', '60x30 inch'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.9,
      numReviews: 29,
      tags: ['smart-living', 'desk', 'standing-desk', 'ergonomic', 'workspace'],
      isFeatured: true,
    },
    {
      title: 'ErgoMesh Pro Fully Adaptive Office Chair',
      slug: 'ergomesh-pro-fully-adaptive-office-chair',
      description: 'German-engineered breathable mesh seat and backrest, dynamic self-adjusting lumbar support, 4D adjustable armrests, and 135-degree recline mechanism.',
      brand: 'ErgoPro',
      category: 'Smart Living',
      subcategory: 'Chairs',
      images: [
        'https://images.unsplash.com/photo-1580481077195-c328ad4f4477?auto=format&fit=crop&w=800&q=80',
      ],
      price: 18499,
      compareAtPrice: 24999,
      discountBadge: '26% OFF',
      sku: 'ERG-CHR-002',
      stock: 20,
      variants: [{ name: 'Frame', options: ['Polished Aluminum', 'Stealth Black'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.8,
      numReviews: 53,
      tags: ['smart-living', 'chair', 'ergonomic', 'office', 'workspace'],
      isFeatured: true,
    },
    {
      title: 'GlowBeam Smart RGBIC Ambient Monitor Light Bar',
      slug: 'glowbeam-smart-rgbic-ambient-monitor-light-bar',
      description: 'Asymmetric optical glare-free design that eliminates screen reflections, dual front warm-to-cool white illumination, and rear dynamic RGB backlighting with wireless desktop rotary dial.',
      brand: 'GlowBeam',
      category: 'Smart Living',
      subcategory: 'Lighting',
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      ],
      price: 2499,
      compareAtPrice: 3499,
      discountBadge: '28% OFF',
      sku: 'GLO-BAR-003',
      stock: 70,
      variants: [{ name: 'Control', options: ['Wireless Knob Dial', 'App Control'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.7,
      numReviews: 88,
      tags: ['smart-living', 'light', 'desk-lamp', 'monitor-bar', 'under-3000'],
      isFeatured: false,
    },
    {
      title: 'AuraBreeze Ultrasonic Aromatherapy Air Purifier',
      slug: 'aurabreeze-ultrasonic-aromatherapy-air-purifier',
      description: 'H13 True HEPA multi-stage filtration capturing 99.97% of airborne particles, whisper-silent 22dB sleep mode, and integrated essential oil diffuser with ambient warm nightlight.',
      brand: 'AuraBreeze',
      category: 'Smart Living',
      subcategory: 'Air Purifiers',
      images: [
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
      ],
      price: 4199,
      compareAtPrice: 5999,
      discountBadge: '30% OFF',
      sku: 'AUR-AIR-004',
      stock: 35,
      variants: [{ name: 'Color', options: ['Frost White', 'Muted Grey'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.6,
      numReviews: 46,
      tags: ['smart-living', 'air-purifier', 'wellness', 'home'],
      isFeatured: false,
    },
    {
      title: 'HydroMate Smart Temperature Control Ember Mug',
      slug: 'hydromate-smart-temperature-control-ember-mug',
      description: 'Precision temperature-controlled ceramic mug keeping coffee or tea hot at your chosen temperature (120°F - 145°F) for up to 2.5 hours on battery or all day on the charging coaster.',
      brand: 'HydroMate',
      category: 'Smart Living',
      subcategory: 'Drinkware',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      ],
      price: 3499,
      compareAtPrice: 4899,
      discountBadge: '28% OFF',
      sku: 'HYD-MUG-005',
      stock: 42,
      variants: [{ name: 'Color', options: ['Matte Black', 'Snow White', 'Rose Gold'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.8,
      numReviews: 61,
      tags: ['smart-living', 'mug', 'coffee', 'gadget', 'desk'],
      isFeatured: false,
    },
    {
      title: 'ZenPad Felt & Top-Grain Leather Large Desk Mat',
      slug: 'zenpad-felt-top-grain-leather-large-desk-mat',
      description: 'Extra-large 90x40cm dual-sided desk protector made with water-resistant vegan leather and soft non-slip natural wool felt backing.',
      brand: 'ZenPad',
      category: 'Smart Living',
      subcategory: 'Accessories',
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      ],
      price: 1399,
      compareAtPrice: 2199,
      discountBadge: '36% OFF',
      sku: 'ZEN-MAT-006',
      stock: 85,
      variants: [{ name: 'Color', options: ['Midnight Black & Grey Felt', 'Tan Brown & Cream Felt'] }],
      sellerId: seller1._id,
      storeId: store1._id,
      rating: 4.6,
      numReviews: 97,
      tags: ['smart-living', 'desk-mat', 'workspace', 'leather', 'under-3000'],
      isFeatured: false,
    },
  ];

  const createdProducts = await Product.insertMany(productsRaw);
  console.log(`✅ Seeded ${createdProducts.length} Premium Realistic Catalog Products with Variants.`);

  // 8. Seed Verified Product Reviews
  const reviewsData = [
    {
      productId: createdProducts[0]._id,
      customerId: customer1._id,
      customerName: customer1.name,
      rating: 5,
      title: 'Unbelievable noise cancellation and soundstage!',
      comment: 'Swapped my high-end Sony cans for the Vanguard Horizon Pro. The 45mm drivers render subtle basslines with zero mud. 60-hour battery life is 100% genuine.',
      verifiedPurchase: true,
      isApproved: true,
    },
    {
      productId: createdProducts[0]._id,
      customerId: customer2._id,
      customerName: customer2.name,
      rating: 5,
      title: 'Worth every single rupee.',
      comment: 'The plush memory foam doesn’t press against my glasses at all. Type-C fast charge got me 5 hours of listening after just 10 minutes plugged in.',
      verifiedPurchase: true,
      isApproved: true,
    },
    {
      productId: createdProducts[1]._id,
      customerId: customer1._id,
      customerName: customer1.name,
      rating: 5,
      title: 'Best earbuds under ₹3,000 bar none.',
      comment: 'The gaming low-latency mode works flawlessly with zero audio lag. Fits super snugly during 5km morning runs.',
      verifiedPurchase: true,
      isApproved: true,
    },
    {
      productId: createdProducts[6]._id, // ApexBook Laptop
      customerId: customer2._id,
      customerName: customer2.name,
      rating: 5,
      title: 'Powerhouse machine for coding and video rendering.',
      comment: 'Compiles huge Next.js and TypeScript monorepos in seconds. The 3.2K 120Hz display is gorgeous and battery easily lasts an entire 10-hour workday.',
      verifiedPurchase: true,
      isApproved: true,
    },
  ];
  await Review.insertMany(reviewsData);
  console.log(`✅ Seeded ${reviewsData.length} Sample Verified Customer Reviews.`);

  // 9. Seed Active Coupons
  await Coupon.insertMany(seedCoupons);
  console.log(`✅ Seeded ${seedCoupons.length} Active Platform Discount Coupons.`);

  // 10. Seed Sample Orders with Analytics Timelines
  const sampleOrders = [
    {
      orderNumber: 'NEX-882104-5192',
      customerId: customer1._id,
      items: [
        {
          productId: createdProducts[0]._id,
          title: createdProducts[0].title,
          image: createdProducts[0].images[0],
          price: createdProducts[0].price,
          quantity: 1,
          variant: { name: 'Color', value: 'Matte Black' },
          sellerId: seller2._id,
          storeId: store2._id,
        },
        {
          productId: createdProducts[1]._id,
          title: createdProducts[1].title,
          image: createdProducts[1].images[0],
          price: createdProducts[1].price,
          quantity: 1,
          variant: { name: 'Color', value: 'Pure White' },
          sellerId: seller2._id,
          storeId: store2._id,
        },
      ],
      storeIds: [store2._id],
      sellerIds: [seller2._id],
      shippingAddress: {
        fullName: 'Rohan Sharma',
        phone: '+91 98765 12345',
        street: '42, Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560038',
        country: 'India',
      },
      paymentStatus: 'demo_paid',
      paymentMethod: 'demo_card',
      orderStatus: 'Delivered',
      subtotal: 8998,
      discount: 899,
      couponCode: 'NEXORA10',
      shippingFee: 0,
      totalAmount: 8099,
      trackingNumber: 'TRK-NX98204918',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(Date.now() - 5 * 86400000), note: 'Order placed.' },
        { status: 'Confirmed', timestamp: new Date(Date.now() - 4 * 86400000), note: 'Payment verified.' },
        { status: 'Processing', timestamp: new Date(Date.now() - 3 * 86400000), note: 'Packed at seller depot.' },
        { status: 'Shipped', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Dispatched via Express Courier.' },
        { status: 'Delivered', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Delivered to resident.' },
      ],
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      orderNumber: 'NEX-901423-7411',
      customerId: customer2._id,
      items: [
        {
          productId: createdProducts[6]._id, // ApexBook
          title: createdProducts[6].title,
          image: createdProducts[6].images[0],
          price: createdProducts[6].price,
          quantity: 1,
          variant: { name: 'Memory', value: '32GB / 1TB SSD' },
          sellerId: seller1._id,
          storeId: store1._id,
        },
      ],
      storeIds: [store1._id],
      sellerIds: [seller1._id],
      shippingAddress: {
        fullName: 'Priya Patel',
        phone: '+91 99123 45678',
        street: '15, BKC Avenue, Bandra East',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400051',
        country: 'India',
      },
      paymentStatus: 'demo_paid',
      paymentMethod: 'demo_upi',
      orderStatus: 'Shipped',
      subtotal: 84999,
      discount: 3000,
      couponCode: 'SAVE20',
      shippingFee: 0,
      totalAmount: 81999,
      trackingNumber: 'TRK-NX84102941',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Order placed.' },
        { status: 'Confirmed', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Payment verified.' },
        { status: 'Processing', timestamp: new Date(Date.now() - 12 * 3600000), note: 'Prepared for courier handover.' },
        { status: 'Shipped', timestamp: new Date(Date.now() - 2 * 3600000), note: 'In transit to Mumbai hub.' },
      ],
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
  ];

  await Order.insertMany(sampleOrders);
  console.log(`✅ Seeded ${sampleOrders.length} Realistic Multi-Vendor Orders with Tracking Timelines.`);

  console.log('\n🎉 =======================================================');
  console.log('   VYAPORA | MULTI-VENDOR MARKETPLACE SEED COMPLETE!');
  console.log('=========================================================');
  console.log('📋 DEMO ACCOUNTS READY:');
  console.log('   👑 Platform Admin:   admin@vyapora.com / admin@nexora.com     (password123)');
  console.log('   🏪 Verified Seller:  seller@vyapora.com / seller@nexora.com   (password123)');
  console.log('   👤 Customer:         customer@vyapora.com / customer@nexora.com (password123)');
  console.log('   👤 Customer 2:       priya@example.com                         (password123)');
  console.log('   🎟️ Active Coupons:   VYAPORA10 (10%), SAVE20 (20%), WELCOME50 (₹500)');
  console.log('=========================================================\n');
};

if (require.main === module) {
  connectDB()
    .then(async () => {
      await runSeed();
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
