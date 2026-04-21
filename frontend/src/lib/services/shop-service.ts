import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function getShopByDomain(shopDomain: string) {
  return prisma.shop.findUnique({
    where: { shopDomain },
    include: {
      assistantSettings: true,
      productSyncConfig: true,
      externalAIConnection: true,
      billingPlan: true,
    },
  });
}
