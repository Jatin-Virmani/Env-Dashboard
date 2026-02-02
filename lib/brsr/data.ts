/**
 * Shared BRSR data helpers for API and report generation.
 * Replace with DB/API later.
 */

import {
  BRSR_TABS,
  TAB_INDICATORS,
  type BRSRTabId,
} from "@/lib/brsr/constants";
import type {
  BRSRMetric,
  BRSRComplianceItem,
  BRSRRiskItem,
  BRSRAuditEntry,
} from "@/lib/brsr/types";

export function sampleMetricsForTab(
  tab: BRSRTabId,
  _companyId: string,
  fy: string
): BRSRMetric[] {
  const indicators = TAB_INDICATORS[tab] ?? [];
  return indicators.map((ind, i) => ({
    indicatorId: ind.id,
    label: ind.label,
    value: ind.unit ? (70 + (i * 5) % 30) : "Yes",
    unit: ind.unit,
    previousValue: ind.unit ? (65 + (i * 3) % 25) : null,
    status: (["compliant", "partial", "non-compliant", "not-reported"] as const)[i % 4],
    target: ind.unit ? 100 : "Yes",
    source: "Excel upload",
    asOf: fy,
  }));
}

export function sampleCompliance(
  _companyId: string,
  _fy: string
): BRSRComplianceItem[] {
  return [
    {
      id: "c1",
      principle: 6,
      section: "Principle 6",
      question: "Energy consumption & intensity disclosed",
      status: "compliant",
      evidence: "BRSR Annexure",
    },
    {
      id: "c2",
      principle: 6,
      section: "Principle 6",
      question: "Water withdrawal & consumption disclosed",
      status: "compliant",
    },
    {
      id: "c3",
      principle: 6,
      section: "Principle 6",
      question: "Waste generated & recovered disclosed",
      status: "partial",
      gap: "E-waste break-up pending",
    },
    {
      id: "c4",
      principle: 1,
      section: "Principle 1",
      question: "Anti-corruption policy & board approval",
      status: "compliant",
    },
    {
      id: "c5",
      principle: 3,
      section: "Principle 3",
      question: "Safety incidents (LTIFR) disclosed",
      status: "non-compliant",
      gap: "LTIFR not reported for workers",
    },
  ];
}

export function sampleRisks(_companyId: string): BRSRRiskItem[] {
  return [
    {
      id: "r1",
      category: "Environment",
      description: "Water withdrawal in water-stress area above threshold",
      severity: "high",
      indicatorId: "6.3",
      mitigation: "ZLD expansion planned",
      reportedAt: new Date().toISOString(),
    },
    {
      id: "r2",
      category: "Workforce",
      description: "Turnover rate for permanent workers above sector average",
      severity: "medium",
      indicatorId: "3.11",
      reportedAt: new Date().toISOString(),
    },
    {
      id: "r3",
      category: "Governance",
      description: "One pending grievance on conflict of interest",
      severity: "low",
      reportedAt: new Date().toISOString(),
    },
  ];
}

export function sampleAudit(
  companyId: string,
  limit: number
): BRSRAuditEntry[] {
  const actions: BRSRAuditEntry["action"][] = [
    "upload",
    "update",
    "export",
    "create",
  ];
  return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
    id: `audit-${i + 1}`,
    entityId: companyId,
    facilityId: i % 3 === 0 ? "F1" : undefined,
    dataPoint: `BRSR Principle ${(i % 9) + 1} – Indicator`,
    indicatorId: `6.${(i % 8) + 1}`,
    action: actions[i % actions.length],
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    newValue: i % 2 === 0 ? 72 : "Disclosed",
    source: "Excel upload",
  }));
}

export type BRSRDataResult = {
  companies: { id: string; name: string; cin: string }[];
  facilities: { id: string; name: string; companyId: string }[];
  timePeriods: string[];
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

export function getBRSRData(
  companyId: string,
  fy: string,
  facilityId: string,
  auditLimit: number
): BRSRDataResult {
  const companies = [
    { id: "default", name: "Demo Listed Entity", cin: "L12345MH2000PLC123456" },
    { id: "company-2", name: "Entity B", cin: "L67890DL2010PLC098765" },
  ];
  const facilities = [
    { id: "F1", name: "Plant – Maharashtra", companyId: "default" },
    { id: "F2", name: "Office – NCR", companyId: "default" },
  ];
  const timePeriods = [
    fy,
    String(parseInt(fy, 10) - 1),
    String(parseInt(fy, 10) - 2),
  ];

  const metricsByTab: Record<string, BRSRMetric[]> = {};
  for (const t of BRSR_TABS) {
    metricsByTab[t] = sampleMetricsForTab(t, companyId, fy);
  }

  const compliance = sampleCompliance(companyId, fy);
  const risks = sampleRisks(companyId);
  const audit = sampleAudit(companyId, auditLimit);

  const compliantCount = compliance.filter((c) => c.status === "compliant").length;
  const totalCount = compliance.length || 1;
  const esgScore = Math.round((compliantCount / totalCount) * 100);

  return {
    companies,
    facilities,
    timePeriods,
    metricsByTab,
    compliance,
    risks,
    audit,
    esgScore,
    complianceStatus: {
      compliant: compliantCount,
      partial: compliance.filter((c) => c.status === "partial").length,
      nonCompliant: compliance.filter((c) => c.status === "non-compliant").length,
      notReported: compliance.filter((c) => c.status === "not-reported").length,
    },
  };
}
