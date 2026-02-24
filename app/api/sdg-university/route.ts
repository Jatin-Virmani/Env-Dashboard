import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SDG_GOALS } from "@/lib/sdg-goals";

export const runtime = "nodejs";

type Contribution = {
  id: string;
  name: string;
  performance: number | null; // 0-100
  schemeSuccess: number | null; // 0-1
  weightedScore: number | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function safeDiv(num: number, den: number) {
  return den ? num / den : 0;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedYear = searchParams.get("year");

    const yearRows = await db.$queryRaw<{ year: number }[]>`
      SELECT DISTINCT EXTRACT(YEAR FROM "visitDate")::int AS year
      FROM "IngestionRow"
      ORDER BY year
    `;

    const years = yearRows.map((r) => r.year).filter((y) => Number.isFinite(y));

    const fallbackYear = years.length ? years[years.length - 1] : new Date().getUTCFullYear();
    const year =
      requestedYear && !Number.isNaN(Number.parseInt(requestedYear, 10))
        ? Number.parseInt(requestedYear, 10)
        : fallbackYear;

    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const agg = await db.ingestionRow.aggregate({
      where: {
        visitDate: { gte: start, lt: end },
      },
      _sum: {
        wetWasteKg: true,
        brownWasteKg: true,
        harvestKg: true,
      },
      _count: { _all: true },
    });

    const wet = agg._sum.wetWasteKg ?? 0;
    const brown = agg._sum.brownWasteKg ?? 0;
    const harvest = agg._sum.harvestKg ?? 0;
    const records = agg._count._all ?? 0;

    const totalWaste = wet + brown;
    const diversionRate = safeDiv(harvest, totalWaste); // 0..1 (rough proxy)

    const yearlyWaste = await db.$queryRaw<{ year: number; waste: number }[]>`
      SELECT
        EXTRACT(YEAR FROM "visitDate")::int AS year,
        COALESCE(SUM("wetWasteKg" + "brownWasteKg"), 0)::float8 AS waste
      FROM "IngestionRow"
      GROUP BY 1
      ORDER BY 1
    `;

    const minWaste = yearlyWaste.length ? Math.min(...yearlyWaste.map((r) => r.waste)) : 0;
    const maxWaste = yearlyWaste.length ? Math.max(...yearlyWaste.map((r) => r.waste)) : 0;
    const currentWaste =
      yearlyWaste.find((r) => r.year === year)?.waste ?? totalWaste;

    const wasteNorm =
      maxWaste > minWaste ? (currentWaste - minWaste) / (maxWaste - minWaste) : (records ? 1 : 0);

    // University-first: compute only what we can support today from DB.
    // - SDG 12: proxy from diversion rate (harvest / total waste) with a practical target.
    // - SDG 13: proxy from scale of waste processed (normalized across years).
    const sdg12Score = records ? clamp((diversionRate / 0.45) * 100, 0, 100) : null;
    const sdg13Score = records ? clamp(wasteNorm * 100, 0, 100) : null;

    const contributions: Contribution[] = SDG_GOALS.map((g) => {
      const base: Contribution = {
        id: g.id,
        name: g.title,
        performance: null,
        schemeSuccess: null,
        weightedScore: null,
      };

      if (g.id === "sdg12") {
        const schemeSuccess = records ? clamp(records / 200, 0, 1) : null; // data completeness proxy
        const perf = sdg12Score;
        return {
          ...base,
          performance: perf,
          schemeSuccess,
          weightedScore:
            perf == null ? null : Number(((perf * (schemeSuccess ?? 1)) / 100).toFixed(2)),
        };
      }

      if (g.id === "sdg13") {
        const schemeSuccess = records ? clamp(records / 200, 0, 1) : null;
        const perf = sdg13Score;
        return {
          ...base,
          performance: perf,
          schemeSuccess,
          weightedScore:
            perf == null ? null : Number(((perf * (schemeSuccess ?? 1)) / 100).toFixed(2)),
        };
      }

      return base;
    });

    return NextResponse.json({
      ok: true,
      years,
      year,
      totals: {
        records,
        wetWasteKg: Number(wet.toFixed(2)),
        brownWasteKg: Number(brown.toFixed(2)),
        harvestKg: Number(harvest.toFixed(2)),
      },
      contributions,
      source: "university" as const,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to build university SDG dashboard.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

