export type TestPhase = "idle" | "ping" | "download" | "upload" | "done" | "error";

export interface ThroughputSample {
  t: number; // ms since test start
  bytes: number; // bytes transferred at this sample point (cumulative)
}

export interface PingResult {
  avgMs: number;
  jitterMs: number;
  packetLossPct: number;
  samples: number[];
}

export interface ThroughputResult {
  bytesPerSec: number;
  peakBytesPerSec: number;
  samples: ThroughputSample[];
}

export interface IpInfo {
  ip: string;
  isp: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  serverRegion: string;
  resolvedVia: string;
}

export interface StrengthResult {
  score: number; // 0-100
  label: string;
  color: string;
}

export interface StreamingRating {
  label: string;
  detail: string;
}

export interface TestResult {
  timestamp: number;
  downloadBytesPerSec: number;
  uploadBytesPerSec: number;
  ping: PingResult;
  strength: StrengthResult;
  streaming: StreamingRating;
  ipInfo: IpInfo | null;
}

export interface HistoryEntry {
  timestamp: number;
  downloadMBps: number;
  uploadMBps: number;
  pingMs: number;
  strengthLabel: string;
}
