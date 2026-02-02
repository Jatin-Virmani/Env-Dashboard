import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getBRSRData } from "@/lib/brsr/data";
import { BRSR_TABS } from "@/lib/brsr/constants";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") ?? "default";
  const fy = searchParams.get("fy") ?? new Date().getFullYear().toString();
  const facilityId = searchParams.get("facilityId") ?? "";
  const format = (searchParams.get("format") ?? "excel").toLowerCase();

  try {
    const result = getBRSRData(companyId, fy, facilityId, 100);
    const company = result.companies.find((c) => c.id === companyId);
    const companyName = company?.name ?? companyId;

    if (format === "excel" || format === "xlsx") {
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ["BRSR Sustainability Report", ""],
        ["Company", companyName],
        ["Financial Year", fy],
        ["Generated", new Date().toISOString()],
        ["ESG Score", result.esgScore],
        ["Compliant", result.complianceStatus.compliant],
        ["Partial", result.complianceStatus.partial],
        ["Non-compliant", result.complianceStatus.nonCompliant],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // Metrics by tab
      for (const tab of BRSR_TABS) {
        const metrics = result.metricsByTab[tab] ?? [];
        const rows = metrics.map((m) => ({
          Indicator: m.indicatorId,
          Label: m.label,
          Current: m.value,
          Previous: m.previousValue,
          Target: m.target,
          Status: m.status,
          Unit: m.unit ?? "",
          Source: m.source ?? "",
        }));
        if (rows.length > 0) {
          const ws = XLSX.utils.json_to_sheet(rows);
          XLSX.utils.book_append_sheet(wb, ws, tab.slice(0, 31));
        }
      }

      // Compliance
      const complianceRows = result.compliance.map((c) => ({
        Section: c.section,
        Question: c.question,
        Status: c.status,
        Gap: c.gap ?? "",
        Evidence: c.evidence ?? "",
      }));
      if (complianceRows.length > 0) {
        const wsCompliance = XLSX.utils.json_to_sheet(complianceRows);
        XLSX.utils.book_append_sheet(wb, wsCompliance, "Compliance");
      }

      // Risks
      const riskRows = result.risks.map((r) => ({
        Category: r.category,
        Description: r.description,
        Severity: r.severity,
        Indicator: r.indicatorId ?? "",
        Mitigation: r.mitigation ?? "",
        Reported: r.reportedAt,
      }));
      if (riskRows.length > 0) {
        const wsRisks = XLSX.utils.json_to_sheet(riskRows);
        XLSX.utils.book_append_sheet(wb, wsRisks, "Risks");
      }

      // Audit trail
      const auditRows = result.audit.map((a) => ({
        Timestamp: a.timestamp,
        Action: a.action,
        DataPoint: a.dataPoint,
        Indicator: a.indicatorId ?? "",
        NewValue: a.newValue,
        Source: a.source,
      }));
      if (auditRows.length > 0) {
        const wsAudit = XLSX.utils.json_to_sheet(auditRows);
        XLSX.utils.book_append_sheet(wb, wsAudit, "Audit Trail");
      }

      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buf, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="BRSR-Report-${companyName.replace(/[^a-zA-Z0-9]/g, "-")}-FY${fy}.xlsx"`,
        },
      });
    }

    if (format === "pdf") {
      // Return HTML report for Print to PDF (no extra PDF lib dependency)
      const html = buildHtmlReport(result, companyName, fy);
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="BRSR-Report-${companyName.replace(/[^a-zA-Z0-9]/g, "-")}-FY${fy}.html"`,
        },
      });
    }

    return NextResponse.json(
      { ok: false, message: "Invalid format. Use format=excel or format=pdf" },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Report generation failed",
      },
      { status: 500 }
    );
  }
}

function buildHtmlReport(
  result: Awaited<ReturnType<typeof getBRSRData>>,
  companyName: string,
  fy: string
): string {
  const sections: string[] = [];
  sections.push(`
    <h1>BRSR Sustainability Report</h1>
    <p><strong>Company:</strong> ${escapeHtml(companyName)} | <strong>FY:</strong> ${fy} | <strong>Generated:</strong> ${new Date().toISOString()}</p>
    <p><strong>ESG Score:</strong> ${result.esgScore} | Compliant: ${result.complianceStatus.compliant} | Partial: ${result.complianceStatus.partial} | Non-compliant: ${result.complianceStatus.nonCompliant}</p>
    <p style="color:#666;font-size:12px;">Open in browser and use Print → Save as PDF for a PDF copy.</p>
  `);

  for (const tab of BRSR_TABS) {
    const metrics = result.metricsByTab[tab] ?? [];
    if (metrics.length === 0) continue;
    sections.push(`<h2>${escapeHtml(tab)}</h2><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Indicator</th><th>Label</th><th>Current</th><th>Previous</th><th>Status</th></tr></thead><tbody>`);
    for (const m of metrics) {
      sections.push(
        `<tr><td>${escapeHtml(String(m.indicatorId))}</td><td>${escapeHtml(m.label)}</td><td>${escapeHtml(String(m.value ?? ""))}</td><td>${escapeHtml(String(m.previousValue ?? ""))}</td><td>${escapeHtml(m.status)}</td></tr>`
      );
    }
    sections.push("</tbody></table>");
  }

  sections.push("<h2>Compliance</h2><table border=\"1\" cellpadding=\"6\" cellspacing=\"0\"><thead><tr><th>Section</th><th>Question</th><th>Status</th><th>Gap</th></tr></thead><tbody>");
  for (const c of result.compliance) {
    sections.push(
      `<tr><td>${escapeHtml(c.section)}</td><td>${escapeHtml(c.question)}</td><td>${escapeHtml(c.status)}</td><td>${escapeHtml(c.gap ?? "")}</td></tr>`
    );
  }
  sections.push("</tbody></table>");

  sections.push("<h2>Risks &amp; Violations</h2><table border=\"1\" cellpadding=\"6\" cellspacing=\"0\"><thead><tr><th>Category</th><th>Description</th><th>Severity</th><th>Mitigation</th></tr></thead><tbody>");
  for (const r of result.risks) {
    sections.push(
      `<tr><td>${escapeHtml(r.category)}</td><td>${escapeHtml(r.description)}</td><td>${escapeHtml(r.severity)}</td><td>${escapeHtml(r.mitigation ?? "")}</td></tr>`
    );
  }
  sections.push("</tbody></table>");

  sections.push("<h2>Audit Trail</h2><table border=\"1\" cellpadding=\"6\" cellspacing=\"0\"><thead><tr><th>Time</th><th>Action</th><th>Data point</th><th>Indicator</th><th>Source</th></tr></thead><tbody>");
  for (const a of result.audit.slice(0, 50)) {
    sections.push(
      `<tr><td>${escapeHtml(a.timestamp)}</td><td>${escapeHtml(a.action)}</td><td>${escapeHtml(a.dataPoint)}</td><td>${escapeHtml(a.indicatorId ?? "")}</td><td>${escapeHtml(a.source)}</td></tr>`
    );
  }
  sections.push("</tbody></table>");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>BRSR Report - ${escapeHtml(companyName)} - FY${fy}</title><style>body{font-family:system-ui,sans-serif;margin:2rem;max-width:900px;} table{width:100%;border-collapse:collapse;margin-bottom:2rem;} th{background:#f0f0f0;text-align:left;} td,th{padding:6px;}</style></head><body>${sections.join("")}</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
