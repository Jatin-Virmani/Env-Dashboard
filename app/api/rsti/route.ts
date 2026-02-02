import { NextResponse } from "next/server";
import {
  SDG_INDICATORS,
  SDG_YEARS,
  getSdgIndicatorContributions,
} from "@/lib/sdg-index";

export const runtime = "nodejs";

export type RstiSource = {
  name: string;
  description: string;
  status: "ok" | "skip" | "error";
  sample?: string;
};

export type RstiGoalRow = {
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedYear = parseInt(
      searchParams.get("year") ?? String(new Date().getFullYear()),
      10,
    );

    const years = SDG_YEARS;
    const year = years.includes(requestedYear)
      ? requestedYear
      : years[years.length - 1];
    const from = years[0];
    const to = years[years.length - 1];

    // Synthetic but deterministic source descriptions (no live API calls).
    const sources: RstiSource[] = [
      {
        name: "UN SDG (synthetic)",
        description: "Sample SDG performance scores derived from SDG goals 1–17.",
        status: "ok",
      },
      {
        name: "Indian schemes (synthetic)",
        description: "Sample scheme success factors for Jal Jeevan, PM Awas, MGNREGA.",
        status: "ok",
      },
      {
        name: "Macro-economy (synthetic)",
        description: "Sample economic factors inspired by World Bank / IMF / OECD data.",
        status: "ok",
      },
    ];

    const { index, contributions } = getSdgIndicatorContributions(
      "India",
      year,
    );

    const goalNames: Record<number, string> = {
      1: "No Poverty", 2: "Zero Hunger", 3: "Good Health", 4: "Quality Education", 5: "Gender Equality",
      6: "Clean Water", 7: "Affordable Energy", 8: "Decent Work", 9: "Industry & Innovation", 10: "Reduced Inequality",
      11: "Sustainable Cities", 12: "Responsible Consumption", 13: "Climate Action", 14: "Life Below Water",
      15: "Life On Land", 16: "Peace & Justice", 17: "Partnerships",
    };

    const goalRows: RstiGoalRow[] = contributions.map((c) => {
      const indicator = SDG_INDICATORS.find((i) => i.id === c.id) ?? SDG_INDICATORS[0];
      const goalNum = parseInt(indicator.indicatorCode.split(".")[0], 10);

      const unSdgScore = c.performance;
      const schemeSuccess = c.schemeSuccess;
      const economicFactor = 1;
      const adjustedSdg = (unSdgScore / 100) * schemeSuccess * economicFactor;
      const contribution = indicator.weight * adjustedSdg;

      return {
        goal: goalNum,
        name: goalNames[goalNum] ?? indicator.name,
        indicatorCode: indicator.indicatorCode,
        weight: indicator.weight,
        unSdgScore: Number(unSdgScore.toFixed(2)),
        schemeSuccess: Number(schemeSuccess.toFixed(2)),
        economicFactor: Number(economicFactor.toFixed(2)),
        adjustedSdg: Number(adjustedSdg.toFixed(2)),
        contribution: Number(contribution.toFixed(2)),
      };
    });

    return NextResponse.json({
      ok: true,
      year,
      from,
      to,
      rsti: Number(index.toFixed(2)),
      formula:
        "Sample RSTI = Σ (Weight × Adjusted_SDG), Adjusted_SDG = UN_SDG × Scheme_Success × Economic_Factor (synthetic data, no live APIs).",
      sources,
      goalRows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "RSTI aggregation failed.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
