"use client";

import * as React from "react";
import {
  BriefcaseBusiness,
  Building2,
  CloudSun,
  Droplets,
  Factory,
  Gavel,
  GraduationCap,
  HandCoins,
  Handshake,
  HeartPulse,
  Leaf,
  Lightbulb,
  Recycle,
  Scale,
  Trees,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SdgGoal } from "@/lib/sdg-goals";

const ICON_BY_SDG: Record<SdgGoal["id"], React.ComponentType<{ className?: string }>> = {
  sdg1: HandCoins,
  sdg2: UtensilsCrossed,
  sdg3: HeartPulse,
  sdg4: GraduationCap,
  sdg5: Scale,
  sdg6: Droplets,
  sdg7: Lightbulb,
  sdg8: BriefcaseBusiness,
  sdg9: Factory,
  sdg10: Scale,
  sdg11: Building2,
  sdg12: Recycle,
  sdg13: CloudSun,
  sdg14: Waves,
  sdg15: Trees,
  sdg16: Gavel,
  sdg17: Handshake,
};

export function SdgIconTile({
  goal,
  selected,
  score,
  loading = false,
  onClick,
}: {
  goal: SdgGoal;
  selected: boolean;
  score?: number | null;
  loading?: boolean;
  onClick: () => void;
}) {
  const Icon = ICON_BY_SDG[goal.id];
  const clamped =
    typeof score === "number" && Number.isFinite(score)
      ? Math.max(0, Math.min(100, score))
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        selected ? "ring-2 ring-primary/60" : "ring-0",
      )}
      aria-pressed={selected}
    >
      <div
        className="relative grid aspect-square w-full place-items-center"
        style={{ backgroundColor: goal.color }}
      >
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full opacity-95"
          aria-hidden="true"
        >
          <rect x="0" y="0" width="120" height="120" fill={goal.color} />
          <circle cx="60" cy="54" r="28" fill="rgba(255,255,255,0.16)" />
          <text
            x="14"
            y="30"
            fill="white"
            fontSize="18"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          >
            SDG
          </text>
          <text
            x="16"
            y="64"
            fill="white"
            fontSize="48"
            fontWeight="800"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          >
            {goal.number}
          </text>
        </svg>

        {clamped !== null ? (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
              <span>Score</span>
              <span className="font-mono tabular-nums">{clamped.toFixed(0)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white/85"
                style={{ width: `${clamped}%` }}
              />
            </div>
          </div>
        ) : loading ? (
          <div className="absolute bottom-3 left-3 right-3 text-[11px] font-medium text-white/90">
            Loading…
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 right-3 text-[11px] font-medium text-white/90">
            No data yet
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted/20 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </span>
          <div className="text-sm font-semibold leading-snug">{goal.title}</div>
        </div>
        <div className="text-xs text-muted-foreground">
          Click to view analytics & action items
        </div>
      </div>
    </button>
  );
}

