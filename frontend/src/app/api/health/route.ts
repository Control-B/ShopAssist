import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "omniweb-ai-shopify",
    timestamp: new Date().toISOString(),
    phase: "foundation",
  });
}
