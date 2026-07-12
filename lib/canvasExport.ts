import type { TestResult } from "./types";
import { bytesPerSecToMBps, bytesPerSecToMbps } from "./units";

export function drawResultCard(canvas: HTMLCanvasElement, result: TestResult) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1200;
  const H = 630;
  canvas.width = W;
  canvas.height = H;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0a0d17");
  bg.addColorStop(1, "#0e1220");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.8, H * 0.15, 0, W * 0.8, H * 0.15, 500);
  glow.addColorStop(0, "rgba(56,189,248,0.25)");
  glow.addColorStop(1, "rgba(56,189,248,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 32px system-ui, sans-serif";
  ctx.fillText("Pulse — Network Speed Test", 64, 90);

  const dlText = `${bytesPerSecToMBps(result.downloadBytesPerSec).toFixed(1)} MB/s`;
  const ulText = `${bytesPerSecToMBps(result.uploadBytesPerSec).toFixed(1)} MB/s`;

  ctx.fillStyle = "#38bdf8";
  ctx.font = "700 92px system-ui, sans-serif";
  ctx.fillText(dlText, 64, 250);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("DOWNLOAD", 64, 285);

  ctx.fillStyle = "#818cf8";
  ctx.font = "700 92px system-ui, sans-serif";
  ctx.fillText(ulText, 64, 410);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("UPLOAD", 64, 445);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillText(`Ping ${result.ping.avgMs.toFixed(0)} ms  •  Jitter ${result.ping.jitterMs.toFixed(0)} ms`, 64, 500);

  ctx.fillStyle = result.strength.color.startsWith("var") ? "#38bdf8" : result.strength.color;
  ctx.font = "600 30px system-ui, sans-serif";
  ctx.fillText(`Network Strength: ${result.strength.label}`, 64, 545);

  ctx.fillStyle = "#64748b";
  ctx.font = "400 22px system-ui, sans-serif";
  ctx.fillText(
    `${new Date(result.timestamp).toLocaleString()}  •  Also: ${bytesPerSecToMbps(result.downloadBytesPerSec).toFixed(0)} Mbps down / ${bytesPerSecToMbps(result.uploadBytesPerSec).toFixed(0)} Mbps up`,
    64,
    590
  );
}

export function exportCanvasAsPng(canvas: HTMLCanvasElement, filename = "speed-test-result.png") {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
