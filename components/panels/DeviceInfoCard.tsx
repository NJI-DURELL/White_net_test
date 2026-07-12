"use client";

import { useEffect, useState } from "react";
import { Laptop2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface DeviceInfo {
  browser: string;
  os: string;
  connectionType: string | null;
}

function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent;

  let browser = "Unknown browser";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/") && !ua.includes("OPR")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
  const connectionType = nav.connection?.effectiveType ?? null;

  return { browser, os, connectionType };
}

export function DeviceInfoCard() {
  const [info, setInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    setInfo(detectDevice());
  }, []);

  return (
    <Card className="flex flex-col gap-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-current/50">
        <Laptop2 size={14} />
        Device
      </span>
      {!info ? (
        <div className="h-10 animate-pulse rounded-lg bg-current/5" />
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-current/45">Browser</span>
            <span className="text-xs font-medium">{info.browser}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-current/45">OS</span>
            <span className="text-xs font-medium">{info.os}</span>
          </div>
          {info.connectionType && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-current/45">Connection</span>
              <span className="text-xs font-medium uppercase">{info.connectionType}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
