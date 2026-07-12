export const DOWNLOAD_DEFAULT_DURATION_MS = 8000;
export const DOWNLOAD_MAX_DURATION_MS = 16000;
export const DOWNLOAD_DEFAULT_CHUNK_BYTES = 65536; // 64KB
export const DOWNLOAD_MIN_CHUNK_BYTES = 16384; // 16KB
export const DOWNLOAD_MAX_CHUNK_BYTES = 262144; // 256KB

export const UPLOAD_TARGET_DURATION_MS = 8000;
export const UPLOAD_BUFFER_BYTES = 24 * 1024 * 1024; // 24MB pre-generated buffer
export const UPLOAD_MAX_ACCEPT_BYTES = 60 * 1024 * 1024; // 60MB hard cap server-side

// A single pass of sequential round-trips: sample 0 is discarded as
// connection warm-up, the rest feed BOTH the latency stats and the loss
// estimate — no more separate "loss-only" batch, which used to double the
// request count and roughly double worst-case test time on high-latency links.
export const PING_SAMPLE_COUNT = 14;
// 800ms was too tight for real-world degraded links (rural 3G/congested
// 4G in areas with poor coverage routinely round-trips 900-2500ms while
// still being a live, working connection) — a request that times out at
// 800ms was being counted as "packet loss" when it was really just slow,
// which inflated loss% and made the whole reading look worse than reality.
export const PING_TIMEOUT_MS = 3000;

export const WARMUP_DISCARD_MS = 1500; // discard first ~1.5s of a throughput test (TCP ramp-up)
// On very slow links a fixed 1.5s warmup can eat a large fraction of a short
// test; never let it exceed this share of the total test duration.
export const WARMUP_DISCARD_MAX_SHARE = 0.2;
export const ROLLING_WINDOW_MS = 500;

// If throughput after warmup looks this low, the test is likely on a slow/
// congested link — extend the run up to DOWNLOAD_MAX_DURATION_MS so the
// average is computed from a statistically meaningful sample instead of a
// few noisy seconds. (~300 KB/s ≈ 2.4 Mbps)
export const SLOW_LINK_THRESHOLD_BYTES_PER_SEC = 300_000;
export const SLOW_LINK_EXTENDED_DURATION_MS = 16000;
// Grace period added on top of the requested test duration before we give up
// waiting for the response entirely — must be generous on slow links, where
// even the connection handshake / first byte can take a while.
export const DOWNLOAD_ABORT_GRACE_MS = 3000;
export const UPLOAD_ABORT_GRACE_MS = 3000;

// Network Strength composite weightings
export const STRENGTH_WEIGHTS = {
  download: 0.4,
  upload: 0.2,
  latency: 0.25,
  stability: 0.15, // jitter + packet loss combined
};

export const STRENGTH_LABELS = [
  { min: 85, label: "Excellent", color: "var(--good)" },
  { min: 65, label: "Good", color: "var(--good)" },
  { min: 45, label: "Fair", color: "var(--warn)" },
  { min: 25, label: "Poor", color: "var(--bad)" },
  { min: 0, label: "Very Weak", color: "var(--bad)" },
] as const;

// Sustained download MB/s thresholds -> streaming capability label
export const STREAMING_THRESHOLDS = [
  { minMBps: 3.1, label: "Great for 4K streaming", detail: "Handles 4K on multiple devices with headroom to spare." },
  { minMBps: 0.65, label: "Good for 1080p streaming", detail: "Smooth Full HD playback on most services." },
  { minMBps: 0.4, label: "OK for 720p / HD-lite", detail: "Standard HD should play, but 4K will buffer." },
  { minMBps: 0.19, label: "SD only", detail: "Standard definition is safest — HD may stutter." },
  { minMBps: 0, label: "Struggles with streaming", detail: "Even SD video may buffer frequently." },
] as const;

export const HISTORY_STORAGE_KEY = "wnt.history.v1";
export const HISTORY_MAX_ENTRIES = 20;
