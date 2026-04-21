import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const shopDomain = process.env.DEV_SEED_SHOP_DOMAIN;

  if (!shopDomain) {
    console.log(
      "Skipping seed because DEV_SEED_SHOP_DOMAIN is not configured.",
    );
    return;
  }

  const shop = await prisma.shop.upsert({
    where: { shopDomain },
    update: {},
    create: {
      shopDomain,
      shopName: "Development Shop",
      isActive: true,
    },
  });

  await prisma.assistantSettings.upsert({
    where: { shopId: shop.id },
    update: {},
    create: {
      shopId: shop.id,
      enabled: false,
      assistantMode: "HYBRID",
      assistantName: "Omniweb AI",
      widgetLauncherText: "Chat with Omniweb AI",
    },
  });

  await prisma.productSyncConfig.upsert({
    where: { shopId: shop.id },
    update: {},
    create: {
      shopId: shop.id,
    },
  });

  await prisma.externalAIConnection.upsert({
    where: { shopId: shop.id },
    update: {},
    create: {
      shopId: shop.id,
      externalClientId: process.env.DEV_OMNIWEB_CLIENT_ID ?? null,
      apiBaseUrl: process.env.OMNIWEB_ENGINE_URL ?? null,
    },
  });

  await prisma.billingPlan.upsert({
    where: { shopId: shop.id },
    update: {},
    create: {
      shopId: shop.id,
      planName: "Starter",
    },
  });

  console.log(`Seeded ${shopDomain}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
