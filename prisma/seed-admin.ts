import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed script for admin/test accounts
 * Run with: npx ts-node prisma/seed-admin.ts
 *
 * This script handles:
 * - Creating/updating the admin account
 * - Merging duplicate merchant records from OAuth
 * - Transferring access tokens from duplicates
 */
async function main() {
  console.log('🔐 Setting up admin account...\n');

  const adminEmail = 'braydonreid01@gmail.com';
  const shopifyShop = 'e6dgjz-cc.myshopify.com';

  // Check if there's a duplicate merchant created by OAuth with the correct shop domain
  const oauthMerchant = await prisma.merchant.findUnique({
    where: { shopifyShop: shopifyShop },
  });

  // Check if admin account already exists
  const adminMerchant = await prisma.merchant.findUnique({
    where: { email: adminEmail },
  });

  let accessToken: string | null = null;

  // If there's a duplicate OAuth merchant that's NOT the admin account, merge it
  if (oauthMerchant && adminMerchant && oauthMerchant.id !== adminMerchant.id) {
    console.log('🔄 Found duplicate OAuth merchant, merging...');
    accessToken = oauthMerchant.shopifyAccessToken;

    // Delete the duplicate (need to clean up related records first)
    await prisma.merchantSettings.deleteMany({ where: { merchantId: oauthMerchant.id } });
    await prisma.shippingOptimizationSettings.deleteMany({ where: { merchantId: oauthMerchant.id } });
    await prisma.orderShippingRecord.deleteMany({ where: { merchantId: oauthMerchant.id } });
    await prisma.emissionRecord.deleteMany({ where: { merchantId: oauthMerchant.id } });
    await prisma.orderItem.deleteMany({
      where: { order: { merchantId: oauthMerchant.id } },
    });
    await prisma.order.deleteMany({ where: { merchantId: oauthMerchant.id } });
    await prisma.product.deleteMany({ where: { merchantId: oauthMerchant.id } });
    await prisma.shippingComparison.deleteMany({ where: { merchantId: oauthMerchant.id } });

    // Now update admin's shopifyShop to null temporarily to avoid unique constraint
    await prisma.merchant.update({
      where: { id: adminMerchant.id },
      data: { shopifyShop: null },
    });

    // Delete the duplicate
    await prisma.merchant.delete({ where: { id: oauthMerchant.id } });
    console.log('✅ Duplicate merchant removed');
  } else if (oauthMerchant && !adminMerchant) {
    // OAuth merchant exists but no admin account — just update it
    accessToken = oauthMerchant.shopifyAccessToken;
  } else if (oauthMerchant && oauthMerchant.id === adminMerchant?.id) {
    // They're the same record, just grab the token
    accessToken = oauthMerchant.shopifyAccessToken;
  }

  // If admin exists but has a different shop with an access token, preserve it
  if (!accessToken && adminMerchant?.shopifyAccessToken) {
    accessToken = adminMerchant.shopifyAccessToken;
  }

  const defaultPassword = await bcrypt.hash('ChangeMe123!', 12);

  const admin = await prisma.merchant.upsert({
    where: { email: adminEmail },
    update: {
      shopifyShop: shopifyShop,
      shopifyAccessToken: accessToken,
      isAdmin: true,
      subscriptionTier: 'premium',
      active: true,
    },
    create: {
      email: adminEmail,
      password: defaultPassword,
      shopifyShop: shopifyShop,
      shopifyAccessToken: accessToken,
      isAdmin: true,
      subscriptionTier: 'premium',
      active: true,
    },
  });

  console.log('✅ Admin account created/updated:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Shopify Store: ${admin.shopifyShop}`);
  console.log(`   Has Access Token: ${!!admin.shopifyAccessToken}`);
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
  if (admin.shopifyAccessToken) {
    console.log('✅ Shopify access token is set — syncing should work!');
  } else {
    console.log('\n⚠️  No Shopify access token found.');
    console.log('   Go to /connect and enter your shop URL to authorize the app.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error setting up admin account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
