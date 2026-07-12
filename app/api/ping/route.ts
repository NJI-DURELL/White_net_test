import { NextResponse } from "next/server";

export const runtime = "edge";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
};

export async function GET() {
  return NextResponse.json({ t: Date.now() }, { headers: NO_CACHE_HEADERS });
}

export async function HEAD() {
  return new Response(null, { status: 204, headers: NO_CACHE_HEADERS });
}
