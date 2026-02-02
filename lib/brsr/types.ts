import type { BRSRTabId } from "./constants";

export type BRSRDisclosureStatus = "compliant" | "partial" | "non-compliant" | "not-reported";

export type BRSRMetric = {
  indicatorId: string;
  label: string;
  value: number | string | null;
  unit?: string;
  previousValue?: number | string | null;
  status: BRSRDisclosureStatus;
  target?: number | string | null;
  source?: string;
  asOf?: string;
};

export type BRSRComplianceItem = {
  id: string;
  principle: number;
  section: string;
  question: string;
  status: BRSRDisclosureStatus;
  evidence?: string;
  gap?: string;
};

export type BRSRRiskItem = {
  id: string;
  category: string;
  description: string;
  severity: "high" | "medium" | "low";
  indicatorId?: string;
  mitigation?: string;
  reportedAt: string;
};

export type BRSRAuditEntry = {
  id: string;
  entityId: string;
  facilityId?: string;
  dataPoint: string;
  indicatorId?: string;
  action: "create" | "update" | "delete" | "upload" | "export";
  userId?: string;
  timestamp: string;
  previousValue?: string | number | null;
  newValue?: string | number | null;
  source: string;
}

export type BRSRGeneralDisclosures = {
  cin: string;
  name: string;
  yearOfIncorporation: number;
  registeredOfficeAddress: string;
  corporateAddress: string;
  email: string;
  telephone: string;
  website: string;
  financialYear: string;
  stockExchanges: string;
  paidUpCapital: number;
  contactPersonName: string;
  contactPersonTelephone: string;
  contactPersonEmail: string;
  reportingBoundary: "standalone" | "consolidated";
};
