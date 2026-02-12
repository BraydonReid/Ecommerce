import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed script for admin/test accounts
 * Run with: npx ts-node prisma/seed-admin.ts
 */
async function main() {
  console.log('🔐 Creating admin account...\n');

  // Create admin test account
  const adminEmail = 'braydonreid01@gmail.com';
  const shopifyShop = 'e6dgjz-cc.myshopify.com';

  // Hash a default password (user should change this)
  // Using a secure default that should be changed
  const defaultPassword = await bcrypt.hash('ChangeMe123!', 12);

  const admin = await prisma.merchant.upsert({
    where: { email: adminEmail },
    update: {
      shopifyShop: shopifyShop,
      isAdmin: true,
      subscriptionTier: 'premium', // Full access for testing
      active: true,
    },
    create: {
      email: adminEmail,
      password: defaultPassword,
      shopifyShop: shopifyShop,
      isAdmin: true,
      subscriptionTier: 'premium',
      active: true,
    },
  });

  console.log('✅ Admin account created/updated:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Shopify Store: ${admin.shopifyShop}`);
  console.log(`   Is Admin: ${admin.isAdmin}`);
  console.log(`   Subscription: ${admin.subscriptionTier}`);

  // Create default settings for admin
  await prisma.merchantSettings.upsert({
    where: { merchantId: admin.id },
    update: {
      enableAIInsights: true,
      emailReports: true,
      trackingEnabled: true,
    },
    create: {
      merchantId: admin.id,
      defaultPackagingType: 'cardboard',
      defaultPackagingWeight: 0.15,
      defaultShippingMode: 'road',
      enableAIInsights: true,
      emailReports: true,
      reportFrequency: 'weekly',
      trackingEnabled: true,
    },
  });

  console.log('✅ Admin settings configured');

  // Create shipping optimization settings
  await prisma.shippingOptimizationSettings.upsert({
    where: { merchantId: admin.id },
    update: {},
    create: {
      merchantId: admin.id,
      costWeight: 50,
      carbonWeight: 50,
      preferredProviderIds: [],
      excludedProviderIds: [],
      requireCarbonOffset: false,
    },
  });

  console.log('✅ Shipping optimization settings configured');

  console.log('\n🎉 Admin setup complete!');
  console.log('\n📧 Login Credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log('   Password: ChangeMe123! (please change after first login)');
  console.log('\n⚠️  IMPORTANT: Change your password after logging in!');
  console.log('\n🔗 To connect your Shopify store:');
  console.log('   1. Go to /connect and enter your Shopify store URL');
  console.log('   2. Authorize the app in Shopify admin');
  console.log('   3. Your orders will sync automatically');
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
