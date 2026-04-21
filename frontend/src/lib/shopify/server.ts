import "server-only";

import "@shopify/shopify-api/adapters/web-api";

import { ApiVersion, shopifyApi } from "@shopify/shopify-api";

import { env } from "@/lib/config/env";

export const SHOPIFY_AUTH_START_PATH = "/api/shopify/auth";
export const SHOPIFY_AUTH_CALLBACK_PATH = "/api/shopify/callback";

export const shopify = shopifyApi({
  apiKey: env.SHOPIFY_API_KEY,
  apiSecretKey: env.SHOPIFY_API_SECRET,
  scopes: env.shopifyScopes,
  hostName: env.appHost,
  hostScheme: env.appProtocol,
  apiVersion: ApiVersion.April26,
  isEmbeddedApp: true,
});

export function buildEmbeddedAppUrl(shop: string, host: string | null) {
  const url = new URL("/overview", env.APP_URL);
  url.searchParams.set("shop", shop);

  if (host) {
    url.searchParams.set("host", host);
  }

  return url;
}
