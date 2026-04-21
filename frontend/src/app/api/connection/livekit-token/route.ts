import { NextResponse } from "next/server";
import { z } from "zod";

import { createLinkedLivekitToken } from "@/lib/services/external-ai-connection-service";
import { normalizeShopDomain } from "@/lib/shopify/normalize-shop-domain";

export const runtime = "nodejs";

const payloadSchema = z.object({
  shop: z.string(),
  channel: z.string().optional(),
  language: z.string().optional(),
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

    const token = await createLinkedLivekitToken({
      shopDomain: shop,
      channel: body.channel,
      language: body.language,
    });

    return NextResponse.json(token);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create LiveKit token.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
