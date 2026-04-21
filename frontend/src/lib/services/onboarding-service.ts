import "server-only";

import { prisma } from "@/lib/db/prisma";

type OnboardShopInput = {
  shopDomain: string;
};

export async function onboardShopDefaults({ shopDomain }: OnboardShopInput) {
  const shop = await prisma.shop.upsert({
    where: { shopDomain },
    update: {
      isActive: true,
    },
    create: {
      shopDomain,
      isActive: true,
    },
  });

  await prisma.$transaction([
    prisma.assistantSettings.upsert({
      where: { shopId: shop.id },
      update: {},
      create: {
        shopId: shop.id,
        enabled: false,
        assistantMode: "HYBRID",
        assistantName: "Omniweb AI",
        welcomeMessage: "Hi! I’m Omniweb AI. How can I help your shoppers today?",
        brandTone: "Helpful, concise, and sales-aware",
        primaryGoal: "Support customers and guide them toward purchase decisions.",
        supportEnabled: true,
        salesEnabled: true,
        leadCaptureEnabled: true,
        voiceEnabled: false,
        chatEnabled: true,
        productRecommendationEnabled: true,
        escalationEnabled: true,
        widgetColor: "#111827",
        widgetPosition: "BOTTOM_RIGHT",
        widgetLauncherText: "Chat with Omniweb AI",
        status: "DRAFT",
      },
    }),
    prisma.productSyncConfig.upsert({
      where: { shopId: shop.id },
      update: {},
      create: {
        shopId: shop.id,
        syncEnabled: true,
        includeProducts: true,
        includeCollections: true,
        includeInventory: true,
        includePricing: true,
        includeDescriptions: true,
        includeTags: true,
        includeImages: true,
        syncStatus: "IDLE",
      },
    }),
    prisma.billingPlan.upsert({
      where: { shopId: shop.id },
      update: {},
      create: {
        shopId: shop.id,
        planName: "Starter",
        usageTier: "pending-assignment",
        billingStatus: "INACTIVE",
      },
    }),
    prisma.externalAIConnection.upsert({
      where: { shopId: shop.id },
      update: {},
      create: {
        shopId: shop.id,
        connectionStatus: "DISCONNECTED",
      },
    }),
  ]);

  return shop;
}
