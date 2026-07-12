"use client";

import { useEffect, useRef } from "react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { drawResultCard, exportCanvasAsPng } from "@/lib/canvasExport";
import type { TestResult } from "@/lib/types";

export function ResultCard({ result }: { result: TestResult }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) drawResultCard(canvasRef.current, result);
  }, [result]);

  const handleDownload = () => {
    if (canvasRef.current) exportCanvasAsPng(canvasRef.current);
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "speed-test-result.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "My network speed test result" });
        } catch {
          // user cancelled share sheet
        }
      } else {
        exportCanvasAsPng(canvasRef.current!);
      }
    }, "image/png");
  };

  return (
    <div className="flex flex-col gap-3">
      <canvas ref={canvasRef} className="hidden" aria-hidden />
      <div className="flex gap-2">
        <Button onClick={handleDownload} variant="ghost" className="flex-1">
          <Download size={15} /> Save Image
        </Button>
        <Button onClick={handleShare} variant="ghost" className="flex-1">
          <Share2 size={15} /> Share
        </Button>
      </div>
    </div>
  );
}
