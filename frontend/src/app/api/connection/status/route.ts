import { NextResponse } from "next/server";

import { getOmniwebConnectionSnapshot } from "@/lib/services/external-ai-connection-service";
import { getShopByDomain } from "@/lib/services/shop-service";
import { normalizeShopDomain } from "@/lib/shopify/normalize-shop-domain";
import { loadOfflineSession } from "@/lib/shopify/session-storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shop = normalizeShopDomain(url.searchParams.get("shop"));

  if (!shop) {
    return NextResponse.json(
      { error: "A valid myshopify.com domain is required." },
      { status: 400 },
    );
  }

  const [session, shopRecord, omniweb] = await Promise.all([
    loadOfflineSession(shop),
    getShopByDomain(shop),
    getOmniwebConnectionSnapshot(shop),
  ]);

  return NextResponse.json({
    shopify: {
      shop,
      authenticated: Boolean(session?.accessToken),
      sessionId: session?.id ?? null,
      shopRecordExists: Boolean(shopRecord),
      assistantEnabled: shopRecord?.assistantSettings?.enabled ?? false,
      externalConnectionStatus:
        shopRecord?.externalAIConnection?.connectionStatus ?? "DISCONNECTED",
    },
    omniweb: {
      configured: Boolean(
        omniweb.connection?.apiBaseUrl &&
          omniweb.connection?.apiKeyEncrypted,
      ),
      engineReachable: omniweb.engineReachable,
      livekitTokenReady: omniweb.livekitTokenReady,
      defaultApiBaseUrl: omniweb.defaultApiBaseUrl,
      apiBaseUrl: omniweb.connection?.apiBaseUrl ?? omniweb.defaultApiBaseUrl,
      externalClientId:
        omniweb.shop?.externalMerchantId ?? null,
      livekitAgentName: omniweb.connection?.livekitAgentName ?? null,
      connectionStatus: omniweb.connection?.connectionStatus ?? "DISCONNECTED",
      lastHealthCheckAt: omniweb.connection?.lastHealthCheckAt ?? null,
      lastError: omniweb.connection?.lastError ?? null,
      readiness: omniweb.readiness,
      profile: omniweb.profile,
    },
  });
}
