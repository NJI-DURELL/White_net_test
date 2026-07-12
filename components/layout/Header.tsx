import { Activity } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-10">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 text-white">
          <Activity size={16} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-current/90">Pulse</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
