import { NextResponse } from "next/server";
import { BRSR_TABS, type BRSRTabId } from "@/lib/brsr/constants";
import { getBRSRData } from "@/lib/brsr/data";

export const runtime = "nodejs";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") ?? "default";
  const facilityId = searchParams.get("facilityId") ?? "";
  const fy = searchParams.get("fy") ?? new Date().getFullYear().toString();
  const tab = searchParams.get("tab") as BRSRTabId | null;
  const includeCompliance = searchParams.get("compliance") !== "false";
  const includeRisks = searchParams.get("risks") !== "false";
  const includeAudit = searchParams.get("audit") !== "false";
  const auditLimit = Math.min(parseInt(searchParams.get("auditLimit") ?? "50", 10), 100);

  try {
    const result = getBRSRData(companyId, fy, facilityId, auditLimit);

    let metricsByTab = result.metricsByTab;
    if (tab && BRSR_TABS.includes(tab)) {
      metricsByTab = { [tab]: result.metricsByTab[tab] ?? [] };
    }

    return NextResponse.json({
      ok: true,
      companies: result.companies,
      facilities: result.facilities,
      timePeriods: result.timePeriods,
      fy,
      companyId,
      facilityId: facilityId || null,
      metricsByTab,
      compliance: includeCompliance ? result.compliance : [],
      risks: includeRisks ? result.risks : [],
      audit: includeAudit ? result.audit : [],
      esgScore: result.esgScore,
      complianceStatus: result.complianceStatus,
    });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "BRSR data failed.");
  }
}
