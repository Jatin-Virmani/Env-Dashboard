"use client";

import * as React from "react";
import Link from "next/link";
import {
  BRSR_TABS,
  type BRSRTabId,
} from "@/lib/brsr/constants";
import type {
  BRSRMetric,
  BRSRComplianceItem,
  BRSRRiskItem,
  BRSRAuditEntry,
} from "@/lib/brsr/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  ArrowLeftIcon,
  RefreshCwIcon,
  DownloadIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HistoryIcon,
  Building2Icon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react";

type Company = { id: string; name: string; cin: string };
type Facility = { id: string; name: string; companyId: string };

type ApiResponse = {
  ok: boolean;
  message?: string;
  companies: Company[];
  facilities: Facility[];
  timePeriods: string[];
  fy: string;
  companyId: string;
  facilityId: string | null;
  metricsByTab: Record<string, BRSRMetric[]>;
  compliance: BRSRComplianceItem[];
  risks: BRSRRiskItem[];
  audit: BRSRAuditEntry[];
  esgScore: number;
  complianceStatus: {
    compliant: number;
    partial: number;
    nonCompliant: number;
    notReported: number;
  };
};

function statusVariant(
  status: BRSRComplianceItem["status"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "compliant":
      return "default";
    case "partial":
      return "secondary";
    case "non-compliant":
      return "destructive";
    default:
      return "outline";
  }
}

function severityVariant(s: BRSRRiskItem["severity"]) {
  switch (s) {
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}

export function BRSRClient() {
  const [companyId, setCompanyId] = React.useState<string>("default");
  const [facilityId, setFacilityId] = React.useState<string>("");
  const [fy, setFy] = React.useState<string>(String(new Date().getFullYear()));
  const [activeTab, setActiveTab] = React.useState<string>("Air");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [reportLoading, setReportLoading] = React.useState<"excel" | "pdf" | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        companyId,
        fy,
        compliance: "true",
        risks: "true",
        audit: "true",
        auditLimit: "50",
      });
      if (facilityId) params.set("facilityId", facilityId);
      const res = await fetch(`/api/brsr?${params}`);
      const json = (await res.json()) as ApiResponse & { message?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "Failed to load BRSR data.");
      }
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "BRSR data failed.");
    } finally {
      setLoading(false);
    }
  }, [companyId, facilityId, fy]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const facilitiesForCompany = React.useMemo(() => {
    if (!data?.facilities) return [];
    return data.facilities.filter((f) => f.companyId === companyId);
  }, [data?.facilities, companyId]);

  const downloadReport = React.useCallback(
    async (format: "excel" | "pdf") => {
      setReportLoading(format);
      try {
        const params = new URLSearchParams({
          companyId,
          fy,
          format,
        });
        if (facilityId) params.set("facilityId", facilityId);
        const res = await fetch(`/api/brsr/report?${params}`);
        if (!res.ok) throw new Error("Report generation failed.");
        const blob = await res.blob();
        const companyName = data?.companies.find((c) => c.id === companyId)?.name ?? companyId;
        if (format === "excel") {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `BRSR-Report-${companyName}-FY${fy}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          // PDF: open HTML report in new tab for Print → Save as PDF
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank", "noopener");
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Report download failed.");
      } finally {
        setReportLoading(null);
      }
    },
    [companyId, facilityId, fy, data?.companies]
  );

  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-neutral-100),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-200),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-neutral-900),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-800),transparent_60%)]" />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium text-muted-foreground">
              BRSR Sustainability Dashboard
            </div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Business Responsibility &amp; Sustainability Reporting
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              SEBI Annexure I – real-time metrics, compliance status, ESG scores, risks and audit trails. Regulatory-grade ESG monitoring.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className="w-[200px]">
                <Building2Icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                {(data?.companies ?? [{ id: "default", name: "Demo Listed Entity", cin: "" }]).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={facilityId || "all"} onValueChange={(v) => setFacilityId(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px]">
                <MapPinIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Facility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All facilities</SelectItem>
                {facilitiesForCompany.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fy} onValueChange={setFy}>
              <SelectTrigger className="w-[110px]">
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="FY" />
              </SelectTrigger>
              <SelectContent>
                {data?.timePeriods.map((y) => (
                  <SelectItem key={y} value={y}>FY {y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCwIcon className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadReport("excel")}
              disabled={reportLoading !== null}
            >
              {reportLoading === "excel" ? (
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheetIcon className="mr-2 h-4 w-4" />
              )}
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadReport("pdf")}
              disabled={reportLoading !== null}
            >
              {reportLoading === "pdf" ? (
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileTextIcon className="mr-2 h-4 w-4" />
              )}
              PDF
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="flex items-center gap-2 pt-6 text-sm text-destructive">
              <AlertTriangleIcon className="h-4 w-4 shrink-0" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* ESG score & compliance summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ESG Score</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-12 w-20 animate-pulse rounded bg-muted/50" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums text-primary">
                    {data?.esgScore ?? "—"}
                  </span>
                  <span className="text-muted-foreground">/ 100</span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-12 w-16 animate-pulse rounded bg-muted/50" />
              ) : (
                <div className="flex items-center gap-1">
                  <CheckCircle2Icon className="h-4 w-4 text-green-600 dark:text-green-500" />
                  <span className="text-2xl font-semibold tabular-nums">
                    {data?.complianceStatus.compliant ?? 0}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Partial</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-12 w-16 animate-pulse rounded bg-muted/50" />
              ) : (
                <span className="text-2xl font-semibold tabular-nums">
                  {data?.complianceStatus.partial ?? 0}
                </span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Non-compliant</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-12 w-16 animate-pulse rounded bg-muted/50" />
              ) : (
                <span className="text-2xl font-semibold tabular-nums text-destructive">
                  {data?.complianceStatus.nonCompliant ?? 0}
                </span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risks</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-12 w-16 animate-pulse rounded bg-muted/50" />
              ) : (
                <span className="text-2xl font-semibold tabular-nums">
                  {data?.risks.length ?? 0}
                </span>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex h-auto flex-wrap gap-1 bg-muted/60 p-1">
            {BRSR_TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-xs sm:text-sm">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {BRSR_TABS.map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>BRSR indicators – {tab}</CardTitle>
                  <CardDescription>
                    Real-time metrics mapped to SEBI BRSR Annexure I (Principle 6 and related).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-48 animate-pulse rounded-lg bg-muted/40" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Indicator</TableHead>
                          <TableHead>Current</TableHead>
                          <TableHead>Previous</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-muted-foreground">Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.metricsByTab[tab] ?? []).map((m) => (
                          <TableRow key={m.indicatorId}>
                            <TableCell className="font-medium">
                              <span className="font-mono text-xs text-muted-foreground">{m.indicatorId}</span>
                              {" – "}
                              {m.label}
                            </TableCell>
                            <TableCell>
                              {m.value != null ? String(m.value) : "—"}
                              {m.unit ? ` ${m.unit}` : ""}
                            </TableCell>
                            <TableCell>
                              {m.previousValue != null ? String(m.previousValue) : "—"}
                              {m.unit ? ` ${m.unit}` : ""}
                            </TableCell>
                            <TableCell>
                              {m.target != null ? String(m.target) : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {m.source ?? "—"} {m.asOf ? ` (${m.asOf})` : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!data?.metricsByTab[tab] || data.metricsByTab[tab].length === 0) && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              No metrics for this tab. Upload or ingest data to populate.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Compliance & risks */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Compliance status</CardTitle>
              <CardDescription>BRSR disclosure status by principle</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 animate-pulse rounded-lg bg-muted/40" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Gap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.compliance.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.section}</TableCell>
                        <TableCell>{c.question}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {c.gap ?? (c.evidence ?? "—")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data?.compliance || data.compliance.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No compliance items.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risks &amp; violations</CardTitle>
              <CardDescription>Gaps and violations against BRSR requirements</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 animate-pulse rounded-lg bg-muted/40" />
              ) : (
                <ul className="space-y-3">
                  {data?.risks.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={severityVariant(r.severity)}>{r.severity}</Badge>
                        {r.indicatorId && (
                          <span className="font-mono text-xs text-muted-foreground">{r.indicatorId}</span>
                        )}
                      </div>
                      <p className="font-medium">{r.description}</p>
                      {r.mitigation && (
                        <p className="text-muted-foreground">Mitigation: {r.mitigation}</p>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {r.reportedAt ? new Date(r.reportedAt).toLocaleString() : ""}
                      </span>
                    </li>
                  ))}
                  {(!data?.risks || data.risks.length === 0) && (
                    <li className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                      No risks or violations reported.
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Audit trail
            </CardTitle>
            <CardDescription>
              Every data point change – uploads, updates, exports. Regulatory-grade traceability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 animate-pulse rounded-lg bg-muted/40" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Data point</TableHead>
                    <TableHead>Indicator</TableHead>
                    <TableHead>New value</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.audit.slice(0, 25).map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                        {new Date(a.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{a.action}</Badge>
                      </TableCell>
                      <TableCell>{a.dataPoint}</TableCell>
                      <TableCell className="font-mono text-xs">{a.indicatorId ?? "—"}</TableCell>
                      <TableCell>
                        {a.newValue != null ? String(a.newValue) : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{a.source}</TableCell>
                    </TableRow>
                  ))}
                  {(!data?.audit || data.audit.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No audit entries.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
