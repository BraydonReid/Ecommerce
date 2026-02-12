import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Shipping provider data with realistic emission factors based on industry research
// Sources: EPA SmartWay, GLEC Framework, carrier sustainability reports
const shippingProviders = [
  {
    name: 'ups',
    displayName: 'UPS',
    type: 'carrier',
    standardEmissionFactor: 0.089, // kg CO2e per ton-km (ground)
    expressEmissionFactor: 0.14,   // kg CO2e per ton-km (2-day)
    overnightEmissionFactor: 1.1,  // kg CO2e per ton-km (air)
    basePricePerKg: 0.45,
    basePricePerKm: 0.008,
    minimumCharge: 8.0,
    avgDeliveryDays: 5,
    sustainabilityRating: 4,
    carbonOffsetAvailable: true,
    serviceLevels: [
      {
        name: 'Ground',
        code: 'ups_ground',
        emissionFactor: 0.089,
        shippingMode: 'road',
        priceMultiplier: 1.0,
        minDeliveryDays: 3,
        maxDeliveryDays: 7,
      },
      {
        name: '3 Day Select',
        code: 'ups_3day',
        emissionFactor: 0.11,
        shippingMode: 'road',
        priceMultiplier: 1.4,
        minDeliveryDays: 3,
        maxDeliveryDays: 3,
      },
      {
        name: '2nd Day Air',
        code: 'ups_2day',
        emissionFactor: 0.14,
        shippingMode: 'road',
        priceMultiplier: 1.8,
        minDeliveryDays: 2,
        maxDeliveryDays: 2,
      },
      {
        name: 'Next Day Air',
        code: 'ups_overnight',
        emissionFactor: 1.1,
        shippingMode: 'air',
        priceMultiplier: 3.0,
        minDeliveryDays: 1,
        maxDeliveryDays: 1,
      },
    ],
  },
  {
    name: 'fedex',
    displayName: 'FedEx',
    type: 'carrier',
    standardEmissionFactor: 0.092,
    expressEmissionFactor: 0.15,
    overnightEmissionFactor: 1.15,
    basePricePerKg: 0.48,
    basePricePerKm: 0.009,
    minimumCharge: 8.5,
    avgDeliveryDays: 5,
    sustainabilityRating: 4,
    carbonOffsetAvailable: true,
    serviceLevels: [
      {
        name: 'Ground',
        code: 'fedex_ground',
        emissionFactor: 0.092,
        shippingMode: 'road',
        priceMultiplier: 1.0,
        minDeliveryDays: 3,
        maxDeliveryDays: 7,
      },
      {
        name: 'Home Delivery',
        code: 'fedex_home',
        emissionFactor: 0.095,
        shippingMode: 'road',
        priceMultiplier: 1.1,
        minDeliveryDays: 2,
        maxDeliveryDays: 5,
      },
      {
        name: 'Express Saver',
        code: 'fedex_express_saver',
        emissionFactor: 0.12,
        shippingMode: 'road',
        priceMultiplier: 1.5,
        minDeliveryDays: 3,
        maxDeliveryDays: 3,
      },
      {
        name: '2Day',
        code: 'fedex_2day',
        emissionFactor: 0.15,
        shippingMode: 'road',
        priceMultiplier: 1.9,
        minDeliveryDays: 2,
        maxDeliveryDays: 2,
      },
      {
        name: 'Priority Overnight',
        code: 'fedex_overnight',
        emissionFactor: 1.15,
        shippingMode: 'air',
        priceMultiplier: 3.2,
        minDeliveryDays: 1,
        maxDeliveryDays: 1,
      },
    ],
  },
  {
    name: 'usps',
    displayName: 'USPS',
    type: 'carrier',
    standardEmissionFactor: 0.075, // Lower due to existing mail routes
    expressEmissionFactor: 0.12,
    overnightEmissionFactor: 1.0,
    basePricePerKg: 0.35,
    basePricePerKm: 0.006,
    minimumCharge: 5.0,
    avgDeliveryDays: 4,
    sustainabilityRating: 5, // Shared routes = more efficient
    carbonOffsetAvailable: false,
    serviceLevels: [
      {
        name: 'Ground Advantage',
        code: 'usps_ground',
        emissionFactor: 0.075,
        shippingMode: 'road',
        priceMultiplier: 1.0,
        minDeliveryDays: 2,
        maxDeliveryDays: 5,
      },
      {
        name: 'Priority Mail',
        code: 'usps_priority',
        emissionFactor: 0.12,
        shippingMode: 'road',
        priceMultiplier: 1.4,
        minDeliveryDays: 1,
        maxDeliveryDays: 3,
      },
      {
        name: 'Priority Mail Express',
        code: 'usps_express',
        emissionFactor: 1.0,
        shippingMode: 'air',
        priceMultiplier: 2.5,
        minDeliveryDays: 1,
        maxDeliveryDays: 2,
      },
    ],
  },
  {
    name: 'dhl',
    displayName: 'DHL',
    type: 'carrier',
    standardEmissionFactor: 0.088,
    expressEmissionFactor: 0.13,
    overnightEmissionFactor: 1.08,
    basePricePerKg: 0.55,
    basePricePerKm: 0.012,
    minimumCharge: 10.0,
    avgDeliveryDays: 6,
    sustainabilityRating: 5, // Strong sustainability commitments
    carbonOffsetAvailable: true,
    serviceLevels: [
      {
        name: 'eCommerce',
        code: 'dhl_ecommerce',
        emissionFactor: 0.088,
        shippingMode: 'road',
        priceMultiplier: 1.0,
        minDeliveryDays: 5,
        maxDeliveryDays: 10,
      },
      {
        name: 'Parcel',
        code: 'dhl_parcel',
        emissionFactor: 0.095,
        shippingMode: 'road',
        priceMultiplier: 1.2,
        minDeliveryDays: 3,
        maxDeliveryDays: 7,
      },
      {
        name: 'Express',
        code: 'dhl_express',
        emissionFactor: 0.13,
        shippingMode: 'road',
        priceMultiplier: 1.8,
        minDeliveryDays: 2,
        maxDeliveryDays: 4,
      },
      {
        name: 'Express Worldwide',
        code: 'dhl_worldwide',
        emissionFactor: 1.08,
        shippingMode: 'air',
        priceMultiplier: 2.8,
        minDeliveryDays: 1,
        maxDeliveryDays: 3,
      },
    ],
  },
];

async function seedShippingProviders() {
  console.log('Seeding shipping providers...');

  for (const providerData of shippingProviders) {
    const { serviceLevels, ...provider } = providerData;

    // Upsert provider
    const createdProvider = await prisma.shippingProvider.upsert({
      where: { name: provider.name },
      update: {
        displayName: provider.displayName,
        type: provider.type,
        standardEmissionFactor: provider.standardEmissionFactor,
        expressEmissionFactor: provider.expressEmissionFactor,
        overnightEmissionFactor: provider.overnightEmissionFactor,
        basePricePerKg: provider.basePricePerKg,
        basePricePerKm: provider.basePricePerKm,
        minimumCharge: provider.minimumCharge,
        avgDeliveryDays: provider.avgDeliveryDays,
        sustainabilityRating: provider.sustainabilityRating,
        carbonOffsetAvailable: provider.carbonOffsetAvailable,
        active: true,
      },
      create: {
        name: provider.name,
        displayName: provider.displayName,
        type: provider.type,
        standardEmissionFactor: provider.standardEmissionFactor,
        expressEmissionFactor: provider.expressEmissionFactor,
        overnightEmissionFactor: provider.overnightEmissionFactor,
        basePricePerKg: provider.basePricePerKg,
        basePricePerKm: provider.basePricePerKm,
        minimumCharge: provider.minimumCharge,
        avgDeliveryDays: provider.avgDeliveryDays,
        sustainabilityRating: provider.sustainabilityRating,
        carbonOffsetAvailable: provider.carbonOffsetAvailable,
        active: true,
      },
    });

    console.log(`  Created/updated provider: ${createdProvider.displayName}`);

    // Upsert service levels
    for (const level of serviceLevels) {
      await prisma.shippingServiceLevel.upsert({
        where: {
          providerId_code: {
            providerId: createdProvider.id,
            code: level.code,
          },
        },
        update: {
          name: level.name,
          emissionFactor: level.emissionFactor,
          shippingMode: level.shippingMode,
          priceMultiplier: level.priceMultiplier,
          minDeliveryDays: level.minDeliveryDays,
          maxDeliveryDays: level.maxDeliveryDays,
          active: true,
        },
        create: {
          providerId: createdProvider.id,
          name: level.name,
          code: level.code,
          emissionFactor: level.emissionFactor,
          shippingMode: level.shippingMode,
          priceMultiplier: level.priceMultiplier,
          minDeliveryDays: level.minDeliveryDays,
          maxDeliveryDays: level.maxDeliveryDays,
          active: true,
        },
      });

      console.log(`    - ${level.name} (${level.code})`);
    }
  }

  console.log('\nShipping providers seeded successfully!');
}

// Run the seed
seedShippingProviders()
  .catch((e) => {
    console.error('Error seeding shipping providers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
