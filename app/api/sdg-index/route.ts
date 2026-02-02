import { NextResponse } from "next/server";
import {
  SDG_YEARS,
  buildSdgIndexSeries,
  getSdgIndicatorContributions,
} from "@/lib/sdg-index";

export const runtime = "nodejs";

const COUNTRY_CODE_BY_NAME: Record<string, number> = {
  India: 356,
  China: 156,
  "United States": 840,
  Germany: 276,
  Brazil: 76,
  "South Africa": 710,
  Japan: 392,
  Australia: 36,
  World: 0,
};

const COUNTRY_NAME_BY_CODE = Object.entries(COUNTRY_CODE_BY_NAME).reduce<
  Record<string, string>
>((acc, [name, code]) => {
  acc[String(code)] = name;
  return acc;
}, {});

const SERIES_BY_COUNTRY = buildSdgIndexSeries();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const requestedCode = searchParams.get("countryCode") ?? "356";
    const requestedYear = searchParams.get("year");

    const countryName =
      COUNTRY_NAME_BY_CODE[requestedCode] ?? "India";

    const years = SDG_YEARS;
    const year =
      requestedYear && !Number.isNaN(Number.parseInt(requestedYear, 10))
        ? Number.parseInt(requestedYear, 10)
        : years[years.length - 1];

    const allCountries = Object.keys(SERIES_BY_COUNTRY);

    const countries = allCountries.map((name) => ({
      name,
      code:
        COUNTRY_CODE_BY_NAME[name] ??
        // fallback stable pseudo-code if we ever add more
        Math.abs(
          Array.from(name).reduce(
            (hash, ch) => ((hash << 5) - hash + ch.charCodeAt(0)) | 0,
            0,
          ),
        ),
    }));

    const countrySeries = SERIES_BY_COUNTRY[countryName] ?? [];

    const series = countrySeries.map((point) => ({
      year: point.year,
      index: point.index,
    }));

    const { contributions } = getSdgIndicatorContributions(
      countryName,
      year,
    );

    return NextResponse.json({
      ok: true,
      countries,
      years,
      series,
      contributions: contributions.map((c) => ({
        id: c.id,
        name: c.name,
        performance: c.performance,
        schemeSuccess: c.schemeSuccess,
        weightedScore: c.weightedScore,
      })),
      source: "sample",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to build SDG index.";
    return NextResponse.json(
      { ok: false, message },
      { status: 500 },
    );
  }
}

