import { NextResponse } from "next/server";

import { onboardShopDefaults } from "@/lib/services/onboarding-service";
import { storeShopifySession } from "@/lib/shopify/session-storage";
import { buildEmbeddedAppUrl, shopify } from "@/lib/shopify/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const authResult = await shopify.auth.callback({
      rawRequest: request,
    });

    await storeShopifySession(authResult.session);
    await onboardShopDefaults({ shopDomain: authResult.session.shop });

    const host = new URL(request.url).searchParams.get("host");
    const response = NextResponse.redirect(
      buildEmbeddedAppUrl(authResult.session.shop, host),
    );

    authResult.headers.forEach((value: string, key: string) => {
      response.headers.append(key, value);
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Shopify auth callback failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
