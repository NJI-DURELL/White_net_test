import { Globe2, Router } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TooltipWrap } from "@/components/ui/Tooltip";
import type { IpInfo } from "@/lib/types";

export function ISPPanel({ ipInfo }: { ipInfo: IpInfo | null }) {
  const location = ipInfo
    ? [ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(", ")
    : null;

  return (
    <Card className="flex flex-col gap-3">
      <TooltipWrap text="Your ISP and location come from your public IP address. The test server shown is the nearest edge node that handled your request — not literal ISP backbone routing.">
        <span className="flex items-center gap-1.5 text-xs font-medium text-current/50">
          <Router size={14} />
          Connection Info
        </span>
      </TooltipWrap>

      {!ipInfo ? (
        <div className="h-16 animate-pulse rounded-lg bg-current/5" />
      ) : (
        <div className="space-y-2 text-sm">
          <Row label="ISP" value={ipInfo.isp ?? "Unavailable"} />
          <Row label="IP Address" value={ipInfo.ip} mono />
          <Row label="Location" value={location || "Unknown"} />
          <Row
            label={
              <span className="inline-flex items-center gap-1">
                <Globe2 size={12} /> Test server
              </span>
            }
            value={ipInfo.serverRegion === "local" ? "Local dev server" : ipInfo.serverRegion}
          />
        </div>
      )}
    </Card>
  );
}

function Row({ label, value, mono }: { label: React.ReactNode; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-current/45">{label}</span>
      <span className={mono ? "font-mono text-xs" : "text-xs font-medium"}>{value}</span>
    </div>
  );
}
