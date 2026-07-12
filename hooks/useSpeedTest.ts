import { useCallback, useRef, useState } from "react";
import { useDownloadTest } from "./useDownloadTest";
import { useUploadTest } from "./useUploadTest";
import { usePingTest } from "./usePingTest";
import { useLocalHistory } from "./useLocalHistory";
import { computeStrength } from "@/lib/scoring";
import { computeStreamingRating } from "@/lib/streamingRating";
import { DOWNLOAD_DEFAULT_DURATION_MS, UPLOAD_TARGET_DURATION_MS } from "@/lib/constants";
import type { IpInfo, PingResult, TestPhase, TestResult } from "@/lib/types";

export interface GraphPoint {
  t: number;
  value: number;
}

const MAX_GRAPH_POINTS = 240;

export function useSpeedTest() {
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [liveBytesPerSec, setLiveBytesPerSec] = useState(0);
  const [graphPoints, setGraphPoints] = useState<GraphPoint[]>([]);
  const [ping, setPing] = useState<PingResult | null>(null);
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = useDownloadTest();
  const upload = useUploadTest();
  const ping_ = usePingTest();
  const { history, addEntry } = useLocalHistory();

  const runIdRef = useRef(0);
  const ipInfoRef = useRef<IpInfo | null>(null);

  const pushGraphPoint = useCallback((value: number, tOffset: number) => {
    setGraphPoints((prev) => {
      const next = [...prev, { t: tOffset, value }];
      return next.length > MAX_GRAPH_POINTS ? next.slice(-MAX_GRAPH_POINTS) : next;
    });
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setLiveBytesPerSec(0);
    setGraphPoints([]);
    setPing(null);
    setResult(null);
    setError(null);
  }, []);

  const start = useCallback(async () => {
    const runId = ++runIdRef.current;
    setError(null);
    setResult(null);
    setGraphPoints([]);
    setLiveBytesPerSec(0);

    // Fire IP/ISP lookup in parallel — it's independent of the throughput tests.
    fetch("/api/ip-info")
      .then((r) => r.json())
      .then((data: IpInfo) => {
        if (runIdRef.current === runId) {
          ipInfoRef.current = data;
          setIpInfo(data);
        }
      })
      .catch(() => {
        if (runIdRef.current === runId) {
          ipInfoRef.current = null;
          setIpInfo(null);
        }
      });

    try {
      setPhase("ping");
      const pingResult = await ping_.run((rtt) => {
        if (runIdRef.current !== runId) return;
        setPing((prev) => ({
          avgMs: rtt,
          jitterMs: prev?.jitterMs ?? 0,
          packetLossPct: prev?.packetLossPct ?? 0,
          samples: [...(prev?.samples ?? []), rtt],
        }));
      });
      if (runIdRef.current !== runId) return;
      setPing(pingResult);

      setPhase("download");
      let graphOffset = 0;
      const downloadResult = await download.run(DOWNLOAD_DEFAULT_DURATION_MS, (instant, elapsed) => {
        if (runIdRef.current !== runId) return;
        setLiveBytesPerSec(instant);
        graphOffset = elapsed;
        pushGraphPoint(instant, elapsed);
      });
      if (runIdRef.current !== runId) return;

      setGraphPoints([]);
      setPhase("upload");
      const uploadResult = await upload.run(UPLOAD_TARGET_DURATION_MS, (instant, elapsed) => {
        if (runIdRef.current !== runId) return;
        setLiveBytesPerSec(instant);
        pushGraphPoint(instant, graphOffset + elapsed);
      });
      if (runIdRef.current !== runId) return;

      const strength = computeStrength({
        downloadBytesPerSec: downloadResult.bytesPerSec,
        uploadBytesPerSec: uploadResult.bytesPerSec,
        pingMs: pingResult.avgMs,
        jitterMs: pingResult.jitterMs,
        packetLossPct: pingResult.packetLossPct,
      });

      const streaming = computeStreamingRating(
        downloadResult.bytesPerSec,
        pingResult.jitterMs,
        pingResult.packetLossPct
      );

      const finalResult: TestResult = {
        timestamp: Date.now(),
        downloadBytesPerSec: downloadResult.bytesPerSec,
        uploadBytesPerSec: uploadResult.bytesPerSec,
        ping: pingResult,
        strength,
        streaming,
        ipInfo: ipInfoRef.current,
      };

      setResult(finalResult);
      setPhase("done");
      addEntry({
        timestamp: finalResult.timestamp,
        downloadMBps: downloadResult.bytesPerSec / 1_000_000,
        uploadMBps: uploadResult.bytesPerSec / 1_000_000,
        pingMs: pingResult.avgMs,
        strengthLabel: strength.label,
      });
    } catch (err) {
      if (runIdRef.current !== runId) return;
      setError(err instanceof Error ? err.message : "Speed test failed");
      setPhase("error");
    }
  }, [download, upload, ping_, addEntry, pushGraphPoint]);

  const cancel = useCallback(() => {
    download.cancel();
    upload.cancel();
    runIdRef.current++;
    reset();
  }, [download, upload, reset]);

  return {
    phase,
    liveBytesPerSec,
    graphPoints,
    ping,
    ipInfo,
    result,
    error,
    history,
    start,
    reset,
    cancel,
  };
}
