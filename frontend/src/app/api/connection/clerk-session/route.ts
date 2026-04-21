import { NextResponse } from "next/server";
import { z } from "zod";

import { exchangeLinkedClerkSession } from "@/lib/services/external-ai-connection-service";
import { normalizeShopDomain } from "@/lib/shopify/normalize-shop-domain";

export const runtime = "nodejs";

const payloadSchema = z.object({
  shop: z.string(),
  clerkToken: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = payloadSchema.parse(await request.json());
    const shop = normalizeShopDomain(body.shop);

    if (!shop) {
      return NextResponse.json(
        { error: "A valid myshopify.com domain is required." },
        { status: 400 },
      );
    }

    const session = await exchangeLinkedClerkSession({
      shopDomain: shop,
      clerkToken: body.clerkToken,
    });

    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to exchange Clerk session.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
