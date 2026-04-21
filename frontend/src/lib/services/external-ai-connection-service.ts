import "server-only";

import { ConnectionStatus } from "@prisma/client";

import { env } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";
import { decryptSecret, encryptSecret } from "@/lib/security/encryption";
import {
  createOmniwebLivekitToken,
  exchangeClerkForEngineSession,
  getOmniwebProfile,
  getOmniwebReadiness,
  normalizeOmniwebBaseUrl,
  OmniwebEngineError,
} from "@/lib/services/omniweb-engine-service";
import { onboardShopDefaults } from "@/lib/services/onboarding-service";
import { getShopByDomain } from "@/lib/services/shop-service";

function getConnectionErrorMessage(error: unknown) {
  if (error instanceof OmniwebEngineError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown external AI connection error.";
}

export async function linkOmniwebConnection(input: {
  shopDomain: string;
  apiBaseUrl: string;
  apiKey: string;
  clientId?: string;
  clerkUserId?: string;
  livekitAgentName?: string;
}) {
  const shop = await onboardShopDefaults({ shopDomain: input.shopDomain });
  const normalizedApiBaseUrl = normalizeOmniwebBaseUrl(input.apiBaseUrl);
  const readiness = await getOmniwebReadiness(normalizedApiBaseUrl);
  const profile = await getOmniwebProfile(normalizedApiBaseUrl, input.apiKey);

  if (input.clientId && input.clientId !== profile.client_id) {
    throw new Error(
      `Client ID mismatch: provided ${input.clientId} but Omniweb returned ${profile.client_id}.`,
    );
  }

  const connection = await prisma.externalAIConnection.upsert({
    where: { shopId: shop.id },
    update: {
      apiBaseUrl: normalizedApiBaseUrl,
      apiKeyEncrypted: encryptSecret(input.apiKey),
      externalClientId: profile.client_id,
      clerkUserId: input.clerkUserId ?? null,
      livekitAgentName: input.livekitAgentName ?? null,
      connectionStatus: "CONNECTED",
      lastHealthCheckAt: new Date(),
      lastError: null,
    },
    create: {
      shopId: shop.id,
      apiBaseUrl: normalizedApiBaseUrl,
      apiKeyEncrypted: encryptSecret(input.apiKey),
      externalClientId: profile.client_id,
      clerkUserId: input.clerkUserId ?? null,
      livekitAgentName: input.livekitAgentName ?? null,
      connectionStatus: "CONNECTED",
      lastHealthCheckAt: new Date(),
      lastError: null,
    },
  });

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      externalMerchantId: profile.client_id,
    },
  });

  return {
    readiness,
    profile,
    connection,
  };
}

export async function getOmniwebConnectionSnapshot(shopDomain: string) {
  const shop = await getShopByDomain(shopDomain);
  const connection = shop?.externalAIConnection ?? null;
  const fallbackApiBaseUrl = env.OMNIWEB_ENGINE_URL ?? null;

  if (!shop) {
    return {
      shop: null,
      connection: null,
      engineReachable: false,
      readiness: null,
      profile: null,
      livekitTokenReady: false,
      defaultApiBaseUrl: fallbackApiBaseUrl,
    };
  }

  if (!connection?.apiBaseUrl || !connection.apiKeyEncrypted) {
    return {
      shop,
      connection,
      engineReachable: false,
      readiness: null,
      profile: null,
      livekitTokenReady: false,
      defaultApiBaseUrl: fallbackApiBaseUrl,
    };
  }

  try {
    const apiKey = decryptSecret(connection.apiKeyEncrypted);
    const [readiness, profile] = await Promise.all([
      getOmniwebReadiness(connection.apiBaseUrl),
      getOmniwebProfile(connection.apiBaseUrl, apiKey),
    ]);

    const nextStatus: ConnectionStatus = readiness.ok ? "CONNECTED" : "DEGRADED";
    const updatedConnection = await prisma.externalAIConnection.update({
      where: { shopId: shop.id },
      data: {
        connectionStatus: nextStatus,
        lastHealthCheckAt: new Date(),
        lastError: readiness.ok ? null : readiness.database_error ?? "Engine readiness check failed.",
        externalClientId: connection.externalClientId ?? profile.client_id,
      },
    });

    return {
      shop,
      connection: updatedConnection,
      engineReachable: true,
      readiness,
      profile,
      livekitTokenReady: Boolean(updatedConnection.externalClientId),
      defaultApiBaseUrl: fallbackApiBaseUrl,
    };
  } catch (error) {
    const message = getConnectionErrorMessage(error);
    const updatedConnection = await prisma.externalAIConnection.update({
      where: { shopId: shop.id },
      data: {
        connectionStatus: "ERROR",
        lastHealthCheckAt: new Date(),
        lastError: message,
      },
    });

    return {
      shop,
      connection: updatedConnection,
      engineReachable: false,
      readiness: null,
      profile: null,
      livekitTokenReady: false,
      defaultApiBaseUrl: fallbackApiBaseUrl,
    };
  }
}

export async function createLinkedLivekitToken(input: {
  shopDomain: string;
  channel?: string;
  language?: string;
}) {
  const shop = await getShopByDomain(input.shopDomain);
  const connection = shop?.externalAIConnection;

  if (!shop || !connection?.apiBaseUrl || !connection.apiKeyEncrypted || !connection.externalClientId) {
    throw new Error("Omniweb connection is incomplete for this shop.");
  }

  const apiKey = decryptSecret(connection.apiKeyEncrypted);

  return createOmniwebLivekitToken(connection.apiBaseUrl, apiKey, {
    clientId: connection.externalClientId,
    channel: input.channel,
    language: input.language,
  });
}

export async function exchangeLinkedClerkSession(input: {
  shopDomain: string;
  clerkToken: string;
}) {
  const shop = await getShopByDomain(input.shopDomain);
  const connection = shop?.externalAIConnection;

  if (!shop || !connection?.apiBaseUrl) {
    throw new Error("Omniweb base URL is not configured for this shop.");
  }

  const session = await exchangeClerkForEngineSession(
    connection.apiBaseUrl,
    input.clerkToken,
  );

  await prisma.externalAIConnection.update({
    where: { shopId: shop.id },
    data: {
      externalClientId: connection.externalClientId ?? session.client_id,
      connectionStatus: "CONNECTED",
      lastHealthCheckAt: new Date(),
      lastError: null,
    },
  });

  return session;
}

export async function clearOmniwebConnection(shopDomain: string) {
  const shop = await getShopByDomain(shopDomain);

  if (!shop?.externalAIConnection) {
    return null;
  }

  return prisma.externalAIConnection.update({
    where: { shopId: shop.id },
    data: {
      apiBaseUrl: null,
      apiKeyEncrypted: null,
      externalClientId: null,
      clerkUserId: null,
      livekitAgentName: null,
      livekitDispatchRuleName: null,
      connectionStatus: "DISCONNECTED",
      lastHealthCheckAt: new Date(),
      lastError: null,
    },
  });
}
