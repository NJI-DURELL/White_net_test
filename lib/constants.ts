export const DOWNLOAD_DEFAULT_DURATION_MS = 8000;
export const DOWNLOAD_MAX_DURATION_MS = 12000;
export const DOWNLOAD_DEFAULT_CHUNK_BYTES = 65536; // 64KB
export const DOWNLOAD_MIN_CHUNK_BYTES = 16384; // 16KB
export const DOWNLOAD_MAX_CHUNK_BYTES = 262144; // 256KB

export const UPLOAD_TARGET_DURATION_MS = 8000;
export const UPLOAD_BUFFER_BYTES = 24 * 1024 * 1024; // 24MB pre-generated buffer
export const UPLOAD_MAX_ACCEPT_BYTES = 60 * 1024 * 1024; // 60MB hard cap server-side

export const PING_SAMPLE_COUNT = 10;
export const PING_LOSS_SAMPLE_COUNT = 20;
export const PING_TIMEOUT_MS = 800;

export const WARMUP_DISCARD_MS = 1500; // discard first ~1.5s of a throughput test (TCP ramp-up)
export const ROLLING_WINDOW_MS = 500;

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
