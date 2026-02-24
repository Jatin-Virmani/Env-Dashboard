"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SDG_GOALS, type SdgGoal } from "@/lib/sdg-goals";
import { SdgIconTile } from "@/components/sdg/sdg-icon-tile";
import {
  type LucideIcon,
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
  Lightbulb,
  Recycle,
  Scale,
  Trees,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

type ApiContribution = {
  id: string;
  name: string;
  performance: number | null;
  schemeSuccess: number | null;
  weightedScore: number | null;
};

type ApiResponse = {
  ok: boolean;
  message?: string;
  years: number[];
  year?: number;
  totals?: { records: number; wetWasteKg: number; brownWasteKg: number; harvestKg: number };
  contributions: ApiContribution[];
  source?: "university";
};

type ElectricitySummaryResponse =
  | {
      ok: true;
      electricityConsumed: { value: number; unit: string; sourceFile?: string } | null;
    }
  | { ok: false; message: string };

type SdgPanel = {
  goal: SdgGoal;
  performance: number | null;
  schemeSuccess: number | null;
  weightedScore: number | null;
};

const ICON_BY_SDG: Record<SdgGoal["id"], LucideIcon> = {
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

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function toPct(value: number | null) {
  if (value === null) return "—";
  return `${Math.round(clamp01(value) * 100)}%`;
}

function toScore(value: number | null) {
  if (value === null) return "—";
  return `${Math.round(Math.max(0, Math.min(100, value)))}`;
}

function actionItemsFor(goalId: string) {
  // Placeholder until the backend provides SDG-specific action items.
  // Keep deterministic & goal-scoped so it’s stable during development.
  switch (goalId) {
    case "sdg7":
      return [
        "Baseline electricity consumption and peak demand by site.",
        "Prioritize LED + HVAC optimization for top 3 high-load facilities.",
        "Create a monthly renewable procurement/rooftop solar plan.",
      ];
    case "sdg12":
      return [
        "Map waste streams (wet/brown/recyclables) and identify leakage points.",
        "Track procurement categories and introduce low-impact alternatives.",
        "Set quarterly targets for segregation rate and diversion from landfill.",
      ];
    case "sdg13":
      return [
        "Compute Scope 1/2 and initial Scope 3 hotspots (travel, procurement).",
        "Define a 12‑month abatement roadmap with owners and timelines.",
        "Add climate risk review into quarterly operations reporting.",
      ];
    default:
      return [
        "Confirm indicator mapping and data sources for this SDG.",
        "Collect baseline metrics and define measurement cadence.",
        "Draft 3–5 initiatives with owners, timelines, and target impact.",
      ];
  }
}

export function SdgActionItemsClient() {
  const [selectedId, setSelectedId] = React.useState<SdgGoal["id"]>("sdg7");
  const [years, setYears] = React.useState<number[]>([]);
  const [year, setYear] = React.useState<string>("");
  const [panels, setPanels] = React.useState<Record<string, SdgPanel>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [totals, setTotals] = React.useState<ApiResponse["totals"] | null>(null);
  const [electricity, setElectricity] = React.useState<{ value: number; unit: string } | null>(null);
  const [electricityLoading, setElectricityLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const sp = new URLSearchParams();
        if (year) sp.set("year", year);
        const res = await fetch(`/api/sdg-university?${sp.toString()}`);
        const json = (await res.json()) as ApiResponse;
        if (!res.ok || !json.ok) {
          throw new Error(json.message || "Failed to load SDG index data.");
        }
        if (cancelled) return;

        setYears(json.years);
        setTotals(json.totals ?? null);
        if (!year && json.years.length) setYear(String(json.years[json.years.length - 1]));

        const byId = new Map<string, ApiContribution>(
          json.contributions.map((c) => [c.id, c]),
        );

        const nextPanels = SDG_GOALS.reduce<Record<string, SdgPanel>>((acc, goal) => {
          const c = byId.get(goal.id);
          acc[goal.id] = {
            goal,
            performance: typeof c?.performance === "number" ? c.performance : null,
            schemeSuccess: typeof c?.schemeSuccess === "number" ? c.schemeSuccess : null,
            weightedScore: typeof c?.weightedScore === "number" ? c.weightedScore : null,
          };
          return acc;
        }, {});

        setPanels(nextPanels);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load SDG index data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [year]);

  React.useEffect(() => {
    let cancelled = false;
    async function loadElectricity() {
      setElectricityLoading(true);
      try {
        const sp = new URLSearchParams();
        if (year) sp.set("year", year);
        const res = await fetch(`/api/pdf-data/energy/summary?${sp.toString()}`);
        const json = (await res.json()) as ElectricitySummaryResponse;

        if (!res.ok || !json.ok) {
          if (!cancelled) setElectricity(null);
          return;
        }

        if (!cancelled) {
          setElectricity(
            json.electricityConsumed ? { value: json.electricityConsumed.value, unit: json.electricityConsumed.unit } : null,
          );
        }
      } catch {
        if (!cancelled) setElectricity(null);
      } finally {
        if (!cancelled) setElectricityLoading(false);
      }
    }

    void loadElectricity();
    return () => {
      cancelled = true;
    };
  }, [year]);

  const selected = panels[selectedId]?.goal
    ? panels[selectedId]
    : { goal: SDG_GOALS[0], performance: null, schemeSuccess: null, weightedScore: null };

  const items = actionItemsFor(selected.goal.id);
  const SelectedIcon = ICON_BY_SDG[selected.goal.id];

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-neutral-100),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-200),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-neutral-900),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-800),transparent_60%)]" />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-muted-foreground">Action Items for Sustainability</div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">SDG dashboard</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Select an SDG to view the current 0–100 score and a starter set of action items.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            <Button asChild variant="outline">
              <Link href="/">Back to overview</Link>
            </Button>
            <div className="flex items-center gap-2">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-9 w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Couldn’t load SDG data</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Electricity consumed</CardTitle>
            </CardHeader>
            <CardContent className="flex items-baseline justify-between gap-3">
              <div className="font-mono text-3xl font-semibold tabular-nums">
                {electricityLoading ? "…" : electricity ? Math.round(electricity.value).toLocaleString() : "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                {electricityLoading ? "" : electricity ? electricity.unit : "No energy data yet"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Goals</CardTitle>
                <Badge variant="outline">Source: University data</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Click any SDG tile to see its score and the related action items.
              </div>
            </CardHeader>
            <CardContent>
              {totals?.records ? (
                <div className="mb-4 grid gap-2 rounded-lg border bg-background/40 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Records</span>
                    <span className="font-mono font-medium tabular-nums">{totals.records}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Total waste (Kg)</span>
                    <span className="font-mono font-medium tabular-nums">
                      {(totals.wetWasteKg + totals.brownWasteKg).toFixed(0)}
                    </span>
                  </div>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {SDG_GOALS.map((goal) => (
                  <SdgIconTile
                    key={goal.id}
                    goal={goal}
                    selected={goal.id === selectedId}
                    score={panels[goal.id]?.performance ?? (loading ? null : null)}
                    loading={loading}
                    onClick={() => setSelectedId(goal.id)}
                  />
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Scores are computed from your university DB where available. SDGs without mapped metrics show “No data yet”.
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:col-span-2">
            <Card className="relative overflow-hidden border-border/60">
              <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-20"
                style={{
                  background:
                    "radial-gradient(circle at top left, var(--tw-gradient-from, rgba(59,130,246,0.18)), transparent 55%)",
                }}
              />
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-border/60"
                      style={{ backgroundColor: `${selected.goal.color}22` }}
                      aria-hidden="true"
                    >
                      <SelectedIcon className="h-4 w-4" color={selected.goal.color} />
                    </span>
                    <span>
                      SDG {selected.goal.number}: {selected.goal.title}
                    </span>
                  </span>
                  <Badge variant="secondary">0–100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-mono text-2xl font-semibold tabular-nums">
                      {toScore(selected.performance)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, selected.performance ?? 0))}%`,
                        backgroundColor: selected.goal.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>

                <div className="grid gap-2 rounded-lg border bg-background/40 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Scheme success</span>
                    <span className="font-mono font-medium tabular-nums">{toPct(selected.schemeSuccess)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weighted score</span>
                    <span className="font-mono font-medium tabular-nums">
                      {selected.weightedScore === null ? "—" : selected.weightedScore.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-border/60"
                      style={{ backgroundColor: `${selected.goal.color}22` }}
                      aria-hidden="true"
                    >
                      <SelectedIcon className="h-4 w-4" color={selected.goal.color} />
                    </span>
                    <span>Action items (preliminary)</span>
                  </span>
                  <Badge variant="outline">SDG {selected.goal.number}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="grid list-decimal gap-2 pl-5 text-sm">
                  {items.map((item) => (
                    <li key={item} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ol>
                <div className="mt-3 text-xs text-muted-foreground">
                  Backend logic for SDG-specific metrics, normalization, and action item recommendations is in progress.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

