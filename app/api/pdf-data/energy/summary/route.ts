import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const ENERGY_OUTPUT_DIR = path.join(process.cwd(), "pdf-output");

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function parseNumber(value: string) {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  try {
    // `year` is accepted for future refinement; current extraction tables may be FY-based.
    void new URL(req.url).searchParams.get("year");

    if (!fs.existsSync(ENERGY_OUTPUT_DIR)) {
      return NextResponse.json(
        { ok: false, message: "Energy audit data not found. Please run the extraction script first." },
        { status: 404 },
      );
    }

    const files = fs.readdirSync(ENERGY_OUTPUT_DIR);
    const csvFiles = files.filter((f) => f.startsWith("energy_table_") && f.endsWith(".csv"));

    for (const filename of csvFiles) {
      const filePath = path.join(ENERGY_OUTPUT_DIR, filename);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").filter((l) => l.trim());
      if (!lines.length) continue;

      const parsed = lines.map(parseCsvLine);
      const headerBlob = parsed
        .slice(0, 4)
        .flat()
        .join(" ")
        .toLowerCase();

      // Heuristic: find the table that looks like monthly electricity consumption.
      // Example headers include: "Total electricity", "consumption", "(kVAh)".
      if (!headerBlob.includes("total electricity") || !headerBlob.includes("consumption")) {
        continue;
      }

      const unit = headerBlob.includes("kvah") ? "kVAh" : headerBlob.includes("kwh") ? "kWh" : "units";

      // Find a "Total" row and take the first numeric value after it.
      for (const row of parsed) {
        const idx = row.findIndex((c) => c.trim().toLowerCase() === "total");
        if (idx === -1) continue;

        for (let j = idx + 1; j < row.length; j += 1) {
          const n = parseNumber(row[j]);
          if (n !== null) {
            return NextResponse.json({
              ok: true,
              electricityConsumed: {
                value: n,
                unit,
                sourceFile: filename,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      electricityConsumed: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to compute electricity consumption summary.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

