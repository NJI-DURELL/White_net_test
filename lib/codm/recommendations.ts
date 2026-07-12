import type { RegionProbeResult } from "./types";
import { getCodmTier } from "./scoring";

export interface CodmRecommendation {
  title: string;
  detail: string;
  tone: "good" | "warn" | "bad" | "neutral";
}

const ISP_TIPS: { match: RegExp; tip: CodmRecommendation }[] = [
  {
    match: /mtn/i,
    tip: {
      title: "MTN Cameroon",
      detail:
        "4G congestion is common in dense areas during peak hours (roughly 7–11pm). If tonight's reading looks worse than usual, re-scan late night or early morning to see your real ceiling.",
      tone: "neutral",
    },
  },
  {
    match: /orange/i,
    tip: {
      title: "Orange CM",
      detail:
        "Orange Fibre (where available) is typically far more stable than Orange 4G for gaming — mobile data jitter climbs fast under load. Prefer the wired line if you have one.",
      tone: "neutral",
    },
  },
  {
    match: /camtel/i,
    tip: {
      title: "Camtel",
      detail:
        "Camtel fiber/CT-Fiber tends to hold the most consistent latency of the wired options where it's available, though coverage is limited outside major cities.",
      tone: "neutral",
    },
  },
  {
    match: /starlink/i,
    tip: {
      title: "Starlink",
      detail:
        "Starlink is a satellite link — physics alone puts a roughly 25–60ms round-trip floor to the ground station on top of normal server distance, even under perfect conditions. It usually beats congested mobile data but rarely beats local fiber.",
      tone: "neutral",
    },
  },
];

export function buildRecommendations(args: {
  best: RegionProbeResult | null;
  regions: RegionProbeResult[];
  ispName: string | null;
}): CodmRecommendation[] {
  const { best, regions, ispName } = args;
  const recs: CodmRecommendation[] = [];

  if (!best || best.codmPingMs == null) {
    recs.push({
      title: "No region was reachable",
      detail:
        "Every test hub timed out or was blocked. This usually means the network itself is down or a firewall is blocking outbound HTTPS — check basic connectivity before queuing a match.",
      tone: "bad",
    });
    return recs;
  }

  const tier = getCodmTier(best.codmPingMs);
  recs.push({
    title: `${tier.label} — ~${best.codmPingMs}ms on ${best.shortLabel}`,
    detail: tier.advice,
    tone: tier.label === "Excellent" || tier.label === "Good" ? "good" : tier.label === "Fair" ? "warn" : "bad",
  });

  // Real UDP jitter tends to sit below HTTPS-measured jitter, but a raw
  // reading this high on the proxy hub still reliably signals an unstable
  // path worth flagging.
  if (best.jitterMs > 25) {
    recs.push({
      title: "Unstable connection detected",
      detail:
        "High jitter on your best route means CODM will likely show rubber-banding or delayed hit registration even though average ping looks OK. Switch to 5GHz WiFi or a wired connection if possible, and close background downloads/streams.",
      tone: "warn",
    });
  }

  if (best.lossPct > 0) {
    recs.push({
      title: `${best.lossPct.toFixed(0)}% packet loss on your best route`,
      detail:
        "Any packet loss causes dropped hit registration and sudden desyncs in CODM. Try restarting your router/modem, moving closer to your WiFi access point, or switching to mobile data to compare.",
      tone: "bad",
    });
  }

  const reachable = regions.filter((r) => r.status === "ok" && r.codmPingMs != null);
  const runnerUp = reachable
    .filter((r) => r.regionId !== best.regionId)
    .sort((a, b) => (a.codmPingMs ?? 999) - (b.codmPingMs ?? 999))[0];

  if (runnerUp && runnerUp.codmPingMs != null && runnerUp.codmPingMs - best.codmPingMs <= 15) {
    recs.push({
      title: `${runnerUp.shortLabel} is nearly as good (~${runnerUp.codmPingMs}ms)`,
      detail: `If your CODM account's server region defaults to ${runnerUp.shortLabel}, you don't need to switch — the difference is within normal match-to-match variance.`,
      tone: "neutral",
    });
  } else {
    recs.push({
      title: `Best available region: ${best.shortLabel}`,
      detail: `In CODM's in-game network/server settings, prefer a server tied to ${best.shortLabel} if you're given the option — it tested clearly ahead of the others from your current connection.`,
      tone: "neutral",
    });
  }

  if (best.codmPingMs >= 100) {
    recs.push({
      title: "Try a custom DNS",
      detail:
        "Browsers can't test DNS resolution time directly, but a slow ISP resolver can still add real delay to matchmaking/connection setup. On your phone or router, try switching DNS to 1.1.1.1 (Cloudflare) or 8.8.8.8 (Google) and re-scan to compare.",
      tone: "neutral",
    });
  }

  const ispTip = ispName ? ISP_TIPS.find((t) => t.match.test(ispName)) : undefined;
  if (ispTip) recs.push(ispTip.tip);

  recs.push({
    title: "Build your ISP comparison",
    detail:
      "Run this scan again next time you're on a different network (another SIM, WiFi, or Starlink) — your best result per ISP is saved below so you can see exactly which one to pick before a ranked session.",
    tone: "neutral",
  });

  return recs;
}
