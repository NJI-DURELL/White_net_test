import { Tv } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { StreamingRating as StreamingRatingType } from "@/lib/types";

export function StreamingRating({ rating }: { rating: StreamingRatingType }) {
  return (
    <Card className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-400/10 text-teal-300">
        <Tv size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold">{rating.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-current/50">{rating.detail}</p>
      </div>
    </Card>
  );
}
