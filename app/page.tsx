"use client";

import { useState } from "react";
import { BackgroundGradient } from "@/components/layout/BackgroundGradient";
import { Header } from "@/components/layout/Header";
import { TestOrchestrator } from "@/components/speed-test/TestOrchestrator";
import { CodmBackground } from "@/components/codm/CodmBackground";
import { CodmPanel } from "@/components/codm/CodmPanel";
import type { ActivePanel } from "@/lib/types";

export default function Home() {
  const [activePanel, setActivePanel] = useState<ActivePanel>("speed");
  const isCodm = activePanel === "codm";

  return (
    <main className={isCodm ? "dark relative flex min-h-screen flex-col" : "relative flex min-h-screen flex-col"}>
      {isCodm ? <CodmBackground /> : <BackgroundGradient />}
      <Header activePanel={activePanel} onPanelChange={setActivePanel} />
      <div className="flex flex-1 items-center justify-center py-10">
        {isCodm ? <CodmPanel /> : <TestOrchestrator />}
      </div>
    </main>
  );
}
