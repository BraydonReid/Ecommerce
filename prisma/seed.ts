import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with mock data...');

  // Create a test merchant
  const merchant = await prisma.merchant.upsert({
    where: { email: 'demo@greencommerce.com' },
    update: {},
    create: {
      email: 'demo@greencommerce.com',
      shopifyShop: 'demo-store.myshopify.com',
      shopifyAccessToken: 'demo_token',
      subscriptionTier: 'premium',
      active: true,
    },
  });

  console.log('✅ Created demo merchant:', merchant.email);

  // Create merchant settings
  await prisma.merchantSettings.upsert({
    where: { merchantId: merchant.id },
    update: {},
    create: {
      merchantId: merchant.id,
      defaultPackagingType: 'cardboard',
      defaultPackagingWeight: 0.15,
      enableAIInsights: true,
      emailReports: true,
      reportFrequency: 'monthly',
    },
  });

  console.log('✅ Created merchant settings');

  // Create sample products
  const products = [
    { title: 'Eco-Friendly T-Shirt', sku: 'ECO-SHIRT-001', weight: 0.2, material: 'organic cotton' },
    { title: 'Reusable Water Bottle', sku: 'BOTTLE-001', weight: 0.3, material: 'stainless steel' },
    { title: 'Bamboo Toothbrush Set', sku: 'BAMBOO-001', weight: 0.05, material: 'bamboo' },
    { title: 'Organic Cotton Tote Bag', sku: 'TOTE-001', weight: 0.15, material: 'organic cotton' },
    { title: 'Solar Phone Charger', sku: 'SOLAR-001', weight: 0.4, material: 'recycled plastic' },
  ];

  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.upsert({
      where: {
        merchantId_shopifyProductId: {
          merchantId: merchant.id,
          shopifyProductId: `prod_${product.sku}`,
        },
      },
      update: {},
      create: {
        merchantId: merchant.id,
        shopifyProductId: `prod_${product.sku}`,
        title: product.title,
        sku: product.sku,
        weight: product.weight,
        material: product.material,
      },
    });
    createdProducts.push(created);
  }

  console.log(`✅ Created ${createdProducts.length} products`);

  // Create sample orders from the past 3 months
  const now = new Date();
  const orders = [];

  for (let i = 0; i < 50; i++) {
    // Random date within last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);

    // Random shipping details
    const shippingMethods = ['road', 'air', 'sea', 'rail'] as const;
    const shippingMethod = shippingMethods[Math.floor(Math.random() * shippingMethods.length)];
    const shippingDistance = Math.floor(Math.random() * 3000) + 100; // 100-3100 km
    const packagingTypes = ['cardboard', 'plastic', 'biodegradable', 'paper'] as const;
    const packagingType = packagingTypes[Math.floor(Math.random() * packagingTypes.length)];

    const order = await prisma.order.create({
      data: {
        merchantId: merchant.id,
        shopifyOrderId: `order_${1000 + i}`,
        orderNumber: `${1000 + i}`,
        totalPrice: Math.floor(Math.random() * 200) + 20,
        shippingDistance,
        shippingMethod,
        originAddress: 'Los Angeles, CA',
        destinationAddress: shippingMethod === 'sea' ? 'Sydney, Australia' : 'New York, NY',
        totalWeight: Math.random() * 2 + 0.5, // 0.5-2.5 kg
        packagingWeight: Math.random() * 0.3 + 0.1, // 0.1-0.4 kg
        packagingType,
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    });
    orders.push(order);

    // Add random products to order
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
    for (let j = 0; j < numItems; j++) {
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: randomProduct.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: Math.floor(Math.random() * 100) + 10,
        },
      });
    }

    // Calculate and store emissions
    const shippingEmissionFactors = {
      air: 1.13,
      sea: 0.011,
      road: 0.096,
      rail: 0.028,
    };

    const packagingEmissionFactors = {
      cardboard: 1.05,
      plastic: 6.0,
      paper: 1.32,
      biodegradable: 0.45,
    };

    const tonKm = (shippingDistance * (order.totalWeight ?? 0)) / 1000;
    const shippingCO2e = tonKm * shippingEmissionFactors[shippingMethod];
    const packagingCO2e = (order.packagingWeight ?? 0) * packagingEmissionFactors[packagingType];
    const totalCO2e = shippingCO2e + packagingCO2e;

    await prisma.emissionRecord.create({
      data: {
        merchantId: merchant.id,
        orderId: order.id,
        totalCO2e,
        shippingCO2e,
        packagingCO2e,
        calculationMethod: 'fallback',
        calculatedAt: orderDate,
      },
    });
  }

  console.log(`✅ Created ${orders.length} orders with emissions data`);

  // Create a sample AI insight
  await prisma.aIInsight.create({
    data: {
      merchantId: merchant.id,
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      summary:
        'Your store processed 18 orders this month, generating 142.5 kg of CO₂ emissions. Shipping accounted for 78% of total emissions, with air freight being the primary contributor. Your average emissions per order decreased by 12% compared to last month, showing positive progress.',
      recommendations:
        '1. Switch to ground shipping for domestic orders - this could reduce shipping emissions by up to 40%.\n2. Consider consolidating orders to reduce the number of individual shipments.\n3. Transition to 100% recycled cardboard packaging to cut packaging emissions by approximately 15%.',
      metrics: {
        totalCO2e: 142.5,
        shippingCO2e: 111.15,
        packagingCO2e: 31.35,
        orderCount: 18,
      },
    },
  });

  console.log('✅ Created sample AI insight');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Demo Login Credentials:');
  console.log('   Email: demo@greencommerce.com');
  console.log('   (No password needed for demo)');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
