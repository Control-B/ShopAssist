import { NextResponse } from "next/server";

import { normalizeShopDomain } from "@/lib/shopify/normalize-shop-domain";
import {
  SHOPIFY_AUTH_CALLBACK_PATH,
  shopify,
} from "@/lib/shopify/server";

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

  return shopify.auth.begin({
    shop,
    callbackPath: SHOPIFY_AUTH_CALLBACK_PATH,
    isOnline: false,
    rawRequest: request,
  });
}
