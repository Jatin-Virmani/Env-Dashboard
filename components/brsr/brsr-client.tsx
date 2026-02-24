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
  SaveIcon,
  EditIcon,
  PlusIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Pie, PieChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

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
  const [activeTab, setActiveTab] = React.useState<string>("General Disclosures");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [reportLoading, setReportLoading] = React.useState<"excel" | "pdf" | null>(null);
  const [editingGeneralDisclosures, setEditingGeneralDisclosures] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [generalDisclosuresForm, setGeneralDisclosuresForm] = React.useState({
    cin: "",
    name: "",
    yearOfIncorporation: "",
    registeredOfficeAddress: "",
    corporateAddress: "",
    email: "",
    telephone: "",
    website: "",
    financialYear: "",
    stockExchanges: "",
    paidUpCapital: "",
    contactPersonName: "",
    contactPersonTelephone: "",
    contactPersonEmail: "",
    reportingBoundary: "consolidated" as "standalone" | "consolidated",
  });

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

  // Initialize General Disclosures form from data
  React.useEffect(() => {
    if (data?.metricsByTab["General Disclosures"]) {
      const metrics = data.metricsByTab["General Disclosures"];
      const formData: Record<string, string> = {};
      metrics.forEach((m) => {
        const key = m.indicatorId.replace("A.", "").toLowerCase();
        if (m.value != null) {
          if (m.indicatorId === "A.1") formData.cin = String(m.value);
          else if (m.indicatorId === "A.2") formData.name = String(m.value);
          else if (m.indicatorId === "A.3") formData.yearOfIncorporation = String(m.value);
          else if (m.indicatorId === "A.4") formData.registeredOfficeAddress = String(m.value);
          else if (m.indicatorId === "A.5") formData.corporateAddress = String(m.value);
          else if (m.indicatorId === "A.6") formData.email = String(m.value);
          else if (m.indicatorId === "A.7") formData.telephone = String(m.value);
          else if (m.indicatorId === "A.8") formData.website = String(m.value);
          else if (m.indicatorId === "A.9") formData.financialYear = String(m.value);
          else if (m.indicatorId === "A.10") formData.stockExchanges = String(m.value);
          else if (m.indicatorId === "A.11") formData.paidUpCapital = String(m.value).replace(/[₹,]/g, "");
          else if (m.indicatorId === "A.12") {
            const contact = String(m.value).split(",");
            formData.contactPersonName = contact[0]?.trim() || "";
            formData.contactPersonTelephone = contact[1]?.trim() || "";
            formData.contactPersonEmail = contact[2]?.trim() || "";
          }
          else if (m.indicatorId === "A.13") formData.reportingBoundary = String(m.value) as "standalone" | "consolidated";
        }
      });
      setGeneralDisclosuresForm((prev) => ({ ...prev, ...formData }));
    }
  }, [data]);

  const saveGeneralDisclosures = React.useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/brsr/general-disclosures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          ...generalDisclosuresForm,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "Failed to save General Disclosures.");
      }
      setEditingGeneralDisclosures(false);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save General Disclosures.");
    } finally {
      setSaving(false);
    }
  }, [load, companyId, generalDisclosuresForm]);

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

        {/* Analysis Charts */}
        {data && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status Distribution</CardTitle>
                <CardDescription>Breakdown of compliance status across all BRSR indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    compliant: { label: "Compliant", color: "#22c55e" },
                    partial: { label: "Partial", color: "#f59e0b" },
                    nonCompliant: { label: "Non-compliant", color: "#ef4444" },
                    notReported: { label: "Not Reported", color: "#94a3b8" },
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={[
                        { name: "Compliant", value: data.complianceStatus.compliant, fill: "#22c55e" },
                        { name: "Partial", value: data.complianceStatus.partial, fill: "#f59e0b" },
                        { name: "Non-compliant", value: data.complianceStatus.nonCompliant, fill: "#ef4444" },
                        { name: "Not Reported", value: data.complianceStatus.notReported, fill: "#94a3b8" },
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
                <CardTitle>Principle-wise Performance</CardTitle>
                <CardDescription>Compliance status by NGRBC principle</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    compliant: { label: "Compliant", color: "#22c55e" },
                    partial: { label: "Partial", color: "#f59e0b" },
                    nonCompliant: { label: "Non-compliant", color: "#ef4444" },
                  }}
                  className="h-[300px]"
                >
                  <BarChart
                    data={Array.from({ length: 9 }, (_, i) => {
                      const principle = i + 1;
                      const principleCompliance = data.compliance.filter((c) => c.principle === principle);
                      const compliant = principleCompliance.filter((c) => c.status === "compliant").length;
                      const partial = principleCompliance.filter((c) => c.status === "partial").length;
                      const nonCompliant = principleCompliance.filter((c) => c.status === "non-compliant").length;
                      return {
                        principle: `P${principle}`,
                        compliant,
                        partial,
                        nonCompliant,
                      };
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="principle" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="compliant" stackId="a" fill="#22c55e" />
                    <Bar dataKey="partial" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
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
              {tab === "General Disclosures" ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Section A: General Disclosures</CardTitle>
                        <CardDescription>
                          Details of the listed entity as per SEBI BRSR Annexure I, Section A.
                        </CardDescription>
                      </div>
                      {!editingGeneralDisclosures ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingGeneralDisclosures(true)}
                        >
                          <EditIcon className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingGeneralDisclosures(false);
                              void load();
                            }}
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => void saveGeneralDisclosures()}
                            disabled={saving}
                          >
                            {saving ? (
                              <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <SaveIcon className="mr-2 h-4 w-4" />
                            )}
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-48 animate-pulse rounded-lg bg-muted/40" />
                    ) : editingGeneralDisclosures ? (
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="cin">1. Corporate Identity Number (CIN)</Label>
                          <Input
                            id="cin"
                            value={generalDisclosuresForm.cin}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, cin: e.target.value }))}
                            placeholder="L12345MH2000PLC123456"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">2. Name of the Listed Entity</Label>
                          <Input
                            id="name"
                            value={generalDisclosuresForm.name}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Company Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yearOfIncorporation">3. Year of incorporation</Label>
                          <Input
                            id="yearOfIncorporation"
                            type="number"
                            value={generalDisclosuresForm.yearOfIncorporation}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, yearOfIncorporation: e.target.value }))}
                            placeholder="2000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="registeredOfficeAddress">4. Registered office address</Label>
                          <Input
                            id="registeredOfficeAddress"
                            value={generalDisclosuresForm.registeredOfficeAddress}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, registeredOfficeAddress: e.target.value }))}
                            placeholder="123 Corporate Tower, Business District, City - PIN"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="corporateAddress">5. Corporate address</Label>
                          <Input
                            id="corporateAddress"
                            value={generalDisclosuresForm.corporateAddress}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, corporateAddress: e.target.value }))}
                            placeholder="123 Corporate Tower, Business District, City - PIN"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">6. E-mail</Label>
                          <Input
                            id="email"
                            type="email"
                            value={generalDisclosuresForm.email}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="contact@company.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telephone">7. Telephone</Label>
                          <Input
                            id="telephone"
                            value={generalDisclosuresForm.telephone}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, telephone: e.target.value }))}
                            placeholder="+91-22-12345678"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">8. Website</Label>
                          <Input
                            id="website"
                            type="url"
                            value={generalDisclosuresForm.website}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, website: e.target.value }))}
                            placeholder="https://www.company.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="financialYear">9. Financial year for which reporting is being done</Label>
                          <Input
                            id="financialYear"
                            value={generalDisclosuresForm.financialYear}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, financialYear: e.target.value }))}
                            placeholder="2024-25"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stockExchanges">10. Name of the Stock Exchange(s) where shares are listed</Label>
                          <Input
                            id="stockExchanges"
                            value={generalDisclosuresForm.stockExchanges}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, stockExchanges: e.target.value }))}
                            placeholder="BSE, NSE"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paidUpCapital">11. Paid-up Capital</Label>
                          <Input
                            id="paidUpCapital"
                            type="number"
                            value={generalDisclosuresForm.paidUpCapital}
                            onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, paidUpCapital: e.target.value }))}
                            placeholder="5000000000"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>12. Name and contact details of the person who may be contacted</Label>
                          <div className="grid gap-4 md:grid-cols-3">
                            <Input
                              placeholder="Name"
                              value={generalDisclosuresForm.contactPersonName}
                              onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, contactPersonName: e.target.value }))}
                            />
                            <Input
                              placeholder="Telephone"
                              value={generalDisclosuresForm.contactPersonTelephone}
                              onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, contactPersonTelephone: e.target.value }))}
                            />
                            <Input
                              type="email"
                              placeholder="Email"
                              value={generalDisclosuresForm.contactPersonEmail}
                              onChange={(e) => setGeneralDisclosuresForm((prev) => ({ ...prev, contactPersonEmail: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="reportingBoundary">13. Reporting boundary</Label>
                          <Select
                            value={generalDisclosuresForm.reportingBoundary}
                            onValueChange={(v) => setGeneralDisclosuresForm((prev) => ({ ...prev, reportingBoundary: v as "standalone" | "consolidated" }))}
                          >
                            <SelectTrigger id="reportingBoundary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standalone">Standalone basis (only for the entity)</SelectItem>
                              <SelectItem value="consolidated">Consolidated basis (entity and all entities in consolidated financial statements)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Indicator</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
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
                                <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>BRSR indicators – {tab}</CardTitle>
                        <CardDescription>
                          Real-time metrics mapped to SEBI BRSR Annexure I. Click on any row to edit values.
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Data
                      </Button>
                    </div>
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
                            <TableRow key={m.indicatorId} className="cursor-pointer hover:bg-muted/50">
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
                                No metrics for this tab. Click &quot;Add Data&quot; to input values.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}
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
