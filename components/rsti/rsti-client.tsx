"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react";

type RstiSource = {
  name: string;
  description: string;
  status: "ok" | "skip" | "error";
  sample?: string;
};

type RstiGoalRow = {
  goal: number;
  name: string;
  indicatorCode: string;
  weight: number;
  unSdgScore: number;
  schemeSuccess: number;
  economicFactor: number;
  adjustedSdg: number;
  contribution: number;
};

const YEARS = Array.from({ length: 12 }, (_, i) => 2015 + i);

export function RstiClient() {
  const [year, setYear] = React.useState<string>(String(new Date().getFullYear()));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rsti, setRsti] = React.useState<number | null>(null);
  const [formula, setFormula] = React.useState<string>("");
  const [sources, setSources] = React.useState<RstiSource[]>([]);
  const [goalRows, setGoalRows] = React.useState<RstiGoalRow[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rsti?year=${year}`);
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        year: number;
        rsti: number;
        formula?: string;
        sources: RstiSource[];
        goalRows: RstiGoalRow[];
      };
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "Failed to load RSTI.");
      }
      setRsti(json.rsti);
      setFormula(json.formula ?? "");
      setSources(json.sources ?? []);
      setGoalRows(json.goalRows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load RSTI.");
    } finally {
      setLoading(false);
    }
  }, [year]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-neutral-100),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-200),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-neutral-900),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-800),transparent_60%)]" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <div className="animate-in fade-in slide-in-from-top-2 flex flex-col items-start justify-between gap-4 duration-300 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-muted-foreground">RSTI Engine</div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Responsible Sustainability Transition Index
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              India-focused index from UN SDG, World Bank, data.gov.in schemes, WHO, IMF, and OECD. Adjusted_SDG = UN_SDG × Scheme_Success × Economic_Factor; RSTI = Σ (Weight × Adjusted_SDG).
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCwIcon className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>RSTI value</CardTitle>
              <CardDescription>Index for selected year (India + global sources)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-24 animate-pulse rounded-lg bg-muted/40" />
              ) : (
                <div className="text-4xl font-bold tabular-nums text-primary">
                  {rsti != null ? rsti.toFixed(2) : "—"}
                </div>
              )}
              {formula ? (
                <p className="mt-2 text-xs text-muted-foreground">{formula}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data sources</CardTitle>
              <CardDescription>APIs used for SDG performance, schemes, economy, health</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
              ) : (
                <ul className="space-y-2 text-sm">
                  {sources.map((s) => (
                    <li key={s.name} className="flex items-start gap-2">
                      <Badge
                        variant={s.status === "ok" ? "default" : s.status === "error" ? "destructive" : "secondary"}
                        className="shrink-0"
                      >
                        {s.status}
                      </Badge>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">{s.name}</span>
                        {" — "}
                        {s.description}
                        {s.sample ? ` (${s.sample})` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Goal breakdown ({year})</CardTitle>
            <CardDescription>Adjusted_SDG = UN_SDG × Scheme_Success × Economic_Factor; contribution = Weight × Adjusted_SDG</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 animate-pulse rounded-lg bg-muted/40" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Indicator</TableHead>
                    <TableHead className="text-right">Weight</TableHead>
                    <TableHead className="text-right">UN SDG</TableHead>
                    <TableHead className="text-right">Scheme %</TableHead>
                    <TableHead className="text-right">Econ factor</TableHead>
                    <TableHead className="text-right">Adjusted SDG</TableHead>
                    <TableHead className="text-right">Contribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goalRows.map((row) => (
                    <TableRow key={row.goal}>
                      <TableCell className="font-medium">{row.goal}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="font-mono text-xs">{row.indicatorCode}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.weight.toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.unSdgScore.toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums">{(row.schemeSuccess * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-right tabular-nums">{row.economicFactor.toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.adjustedSdg.toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{row.contribution.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
