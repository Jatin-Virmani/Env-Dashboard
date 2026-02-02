import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      companyId: string;
      facilityId?: string;
      indicatorId: string;
      label: string;
      value?: string | number | null;
      unit?: string;
      previousValue?: string | number | null;
      target?: string | number | null;
      status?: string;
      source?: string;
      asOf?: string;
      principle: number;
    };

    const {
      companyId,
      facilityId,
      indicatorId,
      label,
      value,
      unit,
      previousValue,
      target,
      status,
      source,
      asOf,
      principle,
    } = body;

    if (!companyId || !indicatorId) {
      return jsonError("companyId and indicatorId are required", 400);
    }

    // Ensure company exists
    await db.bRSRCompany.upsert({
      where: { id: companyId },
      update: {},
      create: {
        id: companyId,
        cin: "",
        name: "New Company",
      },
    });

    // Upsert metric - find existing first
    const existing = await db.bRSRMetric.findFirst({
      where: {
        companyId,
        indicatorId,
        asOf: asOf ?? null,
        facilityId: facilityId ?? null,
      },
    });

    const metric = existing
      ? await db.bRSRMetric.update({
          where: { id: existing.id },
          data: {
            label: label ?? undefined,
            value: value != null ? String(value) : null,
            unit: unit ?? undefined,
            previousValue: previousValue != null ? String(previousValue) : null,
            target: target != null ? String(target) : null,
            status: status ?? "not-reported",
            source: source ?? undefined,
            principle,
            updatedAt: new Date(),
          },
        })
      : await db.bRSRMetric.create({
          data: {
            companyId,
            facilityId: facilityId ?? null,
            indicatorId,
            label: label ?? "",
            value: value != null ? String(value) : null,
            unit: unit ?? undefined,
            previousValue: previousValue != null ? String(previousValue) : null,
            target: target != null ? String(target) : null,
            status: status ?? "not-reported",
            source: source ?? "BRSR Dashboard",
            asOf: asOf ?? null,
            principle,
          },
        });

    // Create audit entry
    await db.bRSRAudit.create({
      data: {
        companyId,
        facilityId: facilityId ?? null,
        dataPoint: label,
        indicatorId,
        action: "update",
        newValue: value != null ? String(value) : null,
        source: source ?? "BRSR Dashboard",
      },
    });

    return NextResponse.json({ ok: true, metric });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Failed to save metric", 500);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") ?? "default";
  const facilityId = searchParams.get("facilityId");
  const asOf = searchParams.get("asOf");

  try {
    const metrics = await db.bRSRMetric.findMany({
      where: {
        companyId,
        ...(facilityId ? { facilityId } : {}),
        ...(asOf ? { asOf } : {}),
      },
      orderBy: [{ principle: "asc" }, { indicatorId: "asc" }],
    });

    return NextResponse.json({ ok: true, metrics });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Failed to load metrics", 500);
  }
}
