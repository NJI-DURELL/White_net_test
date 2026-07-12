import { NextRequest } from "next/server";
import { randomChunk } from "@/lib/randomBytes";
import {
  DOWNLOAD_DEFAULT_CHUNK_BYTES,
  DOWNLOAD_DEFAULT_DURATION_MS,
  DOWNLOAD_MAX_CHUNK_BYTES,
  DOWNLOAD_MAX_DURATION_MS,
  DOWNLOAD_MIN_CHUNK_BYTES,
} from "@/lib/constants";

export const runtime = "edge";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const requestedDuration = Number(url.searchParams.get("duration")) || DOWNLOAD_DEFAULT_DURATION_MS;
  const requestedChunk = Number(url.searchParams.get("chunkSize")) || DOWNLOAD_DEFAULT_CHUNK_BYTES;

  const duration = clamp(requestedDuration, 1000, DOWNLOAD_MAX_DURATION_MS);
  const chunkSize = clamp(requestedChunk, DOWNLOAD_MIN_CHUNK_BYTES, DOWNLOAD_MAX_CHUNK_BYTES);

  const stream = new ReadableStream({
    async start(controller) {
      const start = Date.now();
      const signal = req.signal;

      const onAbort = () => {
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      signal.addEventListener("abort", onAbort);

      try {
        while (Date.now() - start < duration) {
          if (signal.aborted) break;
          controller.enqueue(randomChunk(chunkSize));
          // Yield to the event loop so we don't starve the runtime and so
          // the client's abort signal has a chance to propagate promptly.
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      } finally {
        signal.removeEventListener("abort", onAbort);
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Test-Chunk-Size": String(chunkSize),
      "X-Test-Duration": String(duration),
    },
  });
}
