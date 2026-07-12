import { Activity } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { PanelToggle } from "./PanelToggle";
import type { ActivePanel } from "@/lib/types";

export function Header({
  activePanel,
  onPanelChange,
}: {
  activePanel: ActivePanel;
  onPanelChange: (panel: ActivePanel) => void;
}) {
  // The CODM panel is deliberately always-dark/immersive regardless of the
  // site theme preference, so the light/dark toggle has nothing to do there.
  const showThemeToggle = activePanel !== "codm";

  return (
    <header className="flex flex-col items-center gap-3 px-6 py-5 sm:flex-row sm:justify-between sm:px-10">
      <div className="flex w-full items-center justify-between sm:w-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 text-white">
            <Activity size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-current/90">Pulse</span>
        </div>
        {showThemeToggle && (
          <div className="sm:hidden">
            <ThemeToggle />
          </div>
        )}
      </div>

      <PanelToggle active={activePanel} onChange={onPanelChange} />

      {showThemeToggle && (
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
      )}
    </header>
  );
}
