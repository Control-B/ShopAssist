const SHOP_DOMAIN_REGEX =
  /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

export function normalizeShopDomain(rawShop: string | null): string | null {
  if (!rawShop) {
    return null;
  }

  const normalized = rawShop.trim().toLowerCase();

  if (!SHOP_DOMAIN_REGEX.test(normalized)) {
    return null;
  }

  return normalized;
}
