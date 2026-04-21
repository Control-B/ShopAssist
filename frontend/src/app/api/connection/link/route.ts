import { NextResponse } from "next/server";
import { z } from "zod";

import { clearOmniwebConnection, linkOmniwebConnection } from "@/lib/services/external-ai-connection-service";
import { normalizeShopDomain } from "@/lib/shopify/normalize-shop-domain";

export const runtime = "nodejs";

const linkPayloadSchema = z.object({
  shop: z.string(),
  apiBaseUrl: z.string().url(),
  apiKey: z.string().min(1),
  clientId: z.string().optional(),
  clerkUserId: z.string().optional(),
  livekitAgentName: z.string().optional(),
});

const unlinkPayloadSchema = z.object({
  shop: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = linkPayloadSchema.parse(await request.json());
    const shop = normalizeShopDomain(body.shop);

    if (!shop) {
      return NextResponse.json(
        { error: "A valid myshopify.com domain is required." },
        { status: 400 },
      );
    }

    const result = await linkOmniwebConnection({
      shopDomain: shop,
      apiBaseUrl: body.apiBaseUrl,
      apiKey: body.apiKey,
      clientId: body.clientId,
      clerkUserId: body.clerkUserId,
      livekitAgentName: body.livekitAgentName,
    });

    return NextResponse.json({
      ok: true,
      connectionStatus: result.connection.connectionStatus,
      profile: result.profile,
      readiness: result.readiness,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to link Omniweb connection.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = unlinkPayloadSchema.parse(await request.json());
    const shop = normalizeShopDomain(body.shop);

    if (!shop) {
      return NextResponse.json(
        { error: "A valid myshopify.com domain is required." },
        { status: 400 },
      );
    }

    await clearOmniwebConnection(shop);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to clear Omniweb connection.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
