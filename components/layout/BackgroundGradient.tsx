"use client";

export function BackgroundGradient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(var(--bg-1))_0%,_rgb(var(--bg-0))_60%)] dark:block hidden" />
      <div className="absolute inset-0 hidden dark:block">
        <div className="animate-drift absolute -left-1/4 -top-1/4 h-[60vmax] w-[60vmax] rounded-full bg-sky-500/10 blur-3xl" />
        <div
          className="animate-drift absolute -right-1/4 top-1/3 h-[55vmax] w-[55vmax] rounded-full bg-indigo-500/10 blur-3xl"
          style={{ animationDelay: "-8s" }}
        />
        <div
          className="animate-drift absolute bottom-0 left-1/3 h-[50vmax] w-[50vmax] rounded-full bg-teal-400/10 blur-3xl"
          style={{ animationDelay: "-16s" }}
        />
      </div>

      <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(ellipse_at_top,_#eef2ff_0%,_#f8fafc_55%)]" />
      <div className="absolute inset-0 block dark:hidden">
        <div className="animate-drift absolute -left-1/4 -top-1/4 h-[60vmax] w-[60vmax] rounded-full bg-sky-300/25 blur-3xl" />
        <div
          className="animate-drift absolute -right-1/4 top-1/3 h-[55vmax] w-[55vmax] rounded-full bg-indigo-300/20 blur-3xl"
          style={{ animationDelay: "-8s" }}
        />
      </div>
    </div>
  );
}
