import { NextResponse } from "next/server";

import { loadOfflineSession } from "@/lib/shopify/session-storage";
import { normalizeShopDomain } from "@/lib/shopify/normalize-shop-domain";
import { getShopByDomain } from "@/lib/services/shop-service";

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

  const [session, shopRecord] = await Promise.all([
    loadOfflineSession(shop),
    getShopByDomain(shop),
  ]);

  return NextResponse.json({
    authenticated: Boolean(session?.accessToken),
    shop,
    sessionId: session?.id ?? null,
    shopRecordExists: Boolean(shopRecord),
    assistantEnabled: shopRecord?.assistantSettings?.enabled ?? false,
    externalConnectionStatus:
      shopRecord?.externalAIConnection?.connectionStatus ?? "DISCONNECTED",
  });
}
