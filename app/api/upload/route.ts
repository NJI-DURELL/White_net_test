import { NextRequest, NextResponse } from "next/server";
import { UPLOAD_MAX_ACCEPT_BYTES } from "@/lib/constants";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const start = Date.now();

  if (!req.body) {
    return NextResponse.json({ bytesReceived: 0, serverMs: 0 }, { status: 200 });
  }

  const reader = req.body.getReader();
  let bytesReceived = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesReceived += value?.length ?? 0;
      if (bytesReceived > UPLOAD_MAX_ACCEPT_BYTES) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Payload exceeds test limit" },
          { status: 413 }
        );
      }
    }
  } catch {
    return NextResponse.json({ error: "Upload interrupted" }, { status: 400 });
  }

  return NextResponse.json({
    bytesReceived,
    serverMs: Date.now() - start,
  });
}
