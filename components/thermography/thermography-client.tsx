"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ThermographyRecord = {
  inspection_id: string;
  location: string;
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  remarks: string;
  severity: "CRITICAL" | "WARNING" | "NORMAL";
};

export function ThermographyClient() {
  const [records, setRecords] = React.useState<ThermographyRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = React.useState<"all" | "CRITICAL" | "WARNING" | "NORMAL">("all");

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/pdf-data/thermography");
        const json = (await res.json()) as
          | { ok: true; records: ThermographyRecord[]; count: number }
          | { ok: false; message: string };

        if (!res.ok || !json.ok) {
          setError("message" in json ? json.message : "Failed to load thermography data");
          return;
        }

        setRecords(json.records);
      } catch (err) {
        setError("Failed to load thermography data");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const filtered = React.useMemo(() => {
    if (severityFilter === "all") return records;
    return records.filter((r) => r.severity === severityFilter);
  }, [records, severityFilter]);

  const severityStats = React.useMemo(() => {
    const stats = {
      CRITICAL: 0,
      WARNING: 0,
      NORMAL: 0,
    };
    records.forEach((r) => {
      stats[r.severity]++;
    });
    return stats;
  }, [records]);

  const temperatureDistribution = React.useMemo(() => {
    const ranges = [
      { range: "0-50°C", count: 0 },
      { range: "50-60°C", count: 0 },
      { range: "60-80°C", count: 0 },
      { range: "80-100°C", count: 0 },
      { range: "100+°C", count: 0 },
    ];

    records.forEach((r) => {
      const max = r.max_temp;
      if (max < 50) ranges[0].count++;
      else if (max < 60) ranges[1].count++;
      else if (max < 80) ranges[2].count++;
      else if (max < 100) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }, [records]);

  const topHotSpots = React.useMemo(() => {
    return [...records]
      .sort((a, b) => b.max_temp - a.max_temp)
      .slice(0, 10)
      .map((r) => ({
        id: r.inspection_id,
        location: r.location,
        maxTemp: r.max_temp,
        avgTemp: r.avg_temp,
        severity: r.severity,
      }));
  }, [records]);

  const severityColors = {
    CRITICAL: "#ef4444",
    WARNING: "#f59e0b",
    NORMAL: "#22c55e",
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-neutral-100),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-200),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-neutral-900),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-800),transparent_60%)]" />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
          <div className="flex h-96 items-center justify-center">
            <div className="text-muted-foreground">Loading thermography data...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-neutral-100),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-200),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-neutral-900),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-800),transparent_60%)]" />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Make sure you've run the extraction script: <code className="rounded bg-muted px-1">python scripts\extract_reports.py</code>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-neutral-100),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-200),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-neutral-900),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-800),transparent_60%)]" />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <div className="animate-in fade-in slide-in-from-top-2 flex flex-col items-start justify-between gap-4 duration-300 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-muted-foreground">PDF Reports</div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Thermography Inspections</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Thermal inspection data extracted from PDF reports. Monitor temperature anomalies and severity classifications.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            <Button asChild variant="outline">
              <Link href="/">Back to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/energy-audit">Energy Audit</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Inspections</CardDescription>
              <CardTitle className="text-2xl">{records.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical Issues</CardDescription>
              <CardTitle className="text-2xl text-destructive">{severityStats.CRITICAL}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Warnings</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{severityStats.WARNING}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Normal</CardDescription>
              <CardTitle className="text-2xl text-green-500">{severityStats.NORMAL}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Severity Distribution</CardTitle>
              <CardDescription>Breakdown of inspection severity levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  critical: { label: "Critical", color: "#ef4444" },
                  warning: { label: "Warning", color: "#f59e0b" },
                  normal: { label: "Normal", color: "#22c55e" },
                }}
                className="h-[300px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={[
                      { name: "Critical", value: severityStats.CRITICAL, fill: "#ef4444" },
                      { name: "Warning", value: severityStats.WARNING, fill: "#f59e0b" },
                      { name: "Normal", value: severityStats.NORMAL, fill: "#22c55e" },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Temperature Distribution</CardTitle>
              <CardDescription>Maximum temperature ranges across inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Inspections", color: "#3b82f6" },
                }}
                className="h-[300px]"
              >
                <BarChart data={temperatureDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-1">
              <CardTitle>Inspection Records</CardTitle>
              <CardDescription>Detailed thermography inspection data</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={severityFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSeverityFilter("all")}
              >
                All ({records.length})
              </Button>
              <Button
                variant={severityFilter === "CRITICAL" ? "default" : "outline"}
                size="sm"
                onClick={() => setSeverityFilter("CRITICAL")}
              >
                Critical ({severityStats.CRITICAL})
              </Button>
              <Button
                variant={severityFilter === "WARNING" ? "default" : "outline"}
                size="sm"
                onClick={() => setSeverityFilter("WARNING")}
              >
                Warning ({severityStats.WARNING})
              </Button>
              <Button
                variant={severityFilter === "NORMAL" ? "default" : "outline"}
                size="sm"
                onClick={() => setSeverityFilter("NORMAL")}
              >
                Normal ({severityStats.NORMAL})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Avg Temp</TableHead>
                    <TableHead>Min Temp</TableHead>
                    <TableHead>Max Temp</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((record) => (
                      <TableRow key={record.inspection_id}>
                        <TableCell className="font-mono text-xs">{record.inspection_id}</TableCell>
                        <TableCell className="max-w-xs truncate" title={record.location}>
                          {record.location}
                        </TableCell>
                        <TableCell>{record.avg_temp.toFixed(1)}°C</TableCell>
                        <TableCell>{record.min_temp.toFixed(1)}°C</TableCell>
                        <TableCell className="font-medium">{record.max_temp.toFixed(1)}°C</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.severity === "CRITICAL"
                                ? "destructive"
                                : record.severity === "WARNING"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {record.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground" title={record.remarks}>
                          {record.remarks}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Hot Spots */}
        <Card>
          <CardHeader>
            <CardTitle>Top Hot Spots</CardTitle>
            <CardDescription>Inspections with highest maximum temperatures</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                maxTemp: { label: "Max Temperature (°C)", color: "#ef4444" },
                avgTemp: { label: "Avg Temperature (°C)", color: "#f59e0b" },
              }}
              className="h-[300px]"
            >
              <BarChart data={topHotSpots} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="id" type="category" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="maxTemp" fill="#ef4444" radius={[0, 6, 6, 0]} />
                <Bar dataKey="avgTemp" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
