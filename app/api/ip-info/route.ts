import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface IpApiResponse {
  status: "success" | "fail";
  message?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  isp?: string;
  query?: string;
}

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function GET(req: NextRequest) {
  // Vercel's own edge geo headers are free, instant, and always available in
  // production (blank on `next dev`) — used as the primary/fallback source.
  const vercelCity = req.headers.get("x-vercel-ip-city");
  const vercelRegionName = req.headers.get("x-vercel-ip-country-region");
  const vercelCountry = req.headers.get("x-vercel-ip-country");

  const ip = getClientIp(req);

  const result = {
    ip: ip ?? "Unknown",
    isp: null as string | null,
    city: vercelCity ? decodeURIComponent(vercelCity) : null,
    region: vercelRegionName ? decodeURIComponent(vercelRegionName) : null,
    country: vercelCountry ?? null,
    countryCode: vercelCountry ?? null,
    serverRegion: process.env.VERCEL_REGION ?? "local",
    resolvedVia: "vercel-geo" as string,
  };

  // Enrich with ISP name (and fill any gaps) via the free, keyless ip-api.com
  // lookup. This is best-effort: on failure or rate-limit we fall back to
  // whatever Vercel's own headers already gave us.
  if (ip && ip !== "Unknown" && ip !== "::1" && !ip.startsWith("127.")) {
    try {
      const res = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,isp,query`,
        { signal: AbortSignal.timeout(2500) }
      );
      if (res.ok) {
        const data: IpApiResponse = await res.json();
        if (data.status === "success") {
          result.isp = data.isp ?? null;
          result.city = result.city ?? data.city ?? null;
          result.region = result.region ?? data.regionName ?? null;
          result.country = result.country ?? data.country ?? null;
          result.countryCode = result.countryCode ?? data.countryCode ?? null;
          result.resolvedVia = "ip-api.com";
        }
      }
    } catch {
      // Silent fallback — Vercel geo headers (if any) already populated `result`.
    }
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
