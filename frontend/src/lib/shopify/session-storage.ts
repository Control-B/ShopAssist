import "server-only";

import type { Session } from "@shopify/shopify-api";

import { prisma } from "@/lib/db/prisma";

export async function storeShopifySession(session: Session) {
  const sessionEntries = Object.fromEntries(session.toPropertyArray(true));

  return prisma.session.upsert({
    where: { id: session.id },
    update: {
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope,
      expires: session.expires,
      accessToken: session.accessToken ?? "",
      userId:
        typeof sessionEntries.userId === "bigint"
          ? sessionEntries.userId
          : sessionEntries.userId
            ? BigInt(String(sessionEntries.userId))
            : null,
      firstName:
        typeof sessionEntries.firstName === "string"
          ? sessionEntries.firstName
          : null,
      lastName:
        typeof sessionEntries.lastName === "string"
          ? sessionEntries.lastName
          : null,
      email:
        typeof sessionEntries.email === "string" ? sessionEntries.email : null,
      accountOwner:
        typeof sessionEntries.accountOwner === "boolean"
          ? sessionEntries.accountOwner
          : null,
      locale:
        typeof sessionEntries.locale === "string" ? sessionEntries.locale : null,
      collaborator:
        typeof sessionEntries.collaborator === "boolean"
          ? sessionEntries.collaborator
          : null,
      emailVerified:
        typeof sessionEntries.emailVerified === "boolean"
          ? sessionEntries.emailVerified
          : null,
      refreshToken: session.refreshToken ?? null,
      refreshTokenExpires: session.refreshTokenExpires ?? null,
    },
    create: {
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope,
      expires: session.expires,
      accessToken: session.accessToken ?? "",
      userId:
        typeof sessionEntries.userId === "bigint"
          ? sessionEntries.userId
          : sessionEntries.userId
            ? BigInt(String(sessionEntries.userId))
            : null,
      firstName:
        typeof sessionEntries.firstName === "string"
          ? sessionEntries.firstName
          : null,
      lastName:
        typeof sessionEntries.lastName === "string"
          ? sessionEntries.lastName
          : null,
      email:
        typeof sessionEntries.email === "string" ? sessionEntries.email : null,
      accountOwner:
        typeof sessionEntries.accountOwner === "boolean"
          ? sessionEntries.accountOwner
          : null,
      locale:
        typeof sessionEntries.locale === "string" ? sessionEntries.locale : null,
      collaborator:
        typeof sessionEntries.collaborator === "boolean"
          ? sessionEntries.collaborator
          : null,
      emailVerified:
        typeof sessionEntries.emailVerified === "boolean"
          ? sessionEntries.emailVerified
          : null,
      refreshToken: session.refreshToken ?? null,
      refreshTokenExpires: session.refreshTokenExpires ?? null,
    },
  });
}

export async function loadOfflineSession(shop: string) {
  return prisma.session.findFirst({
    where: {
      shop,
      isOnline: false,
    },
    orderBy: {
      expires: "desc",
    },
  });
}

export async function deleteSessionsForShop(shop: string) {
  return prisma.session.deleteMany({
    where: { shop },
  });
}
