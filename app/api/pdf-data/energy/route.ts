import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const ENERGY_OUTPUT_DIR = path.join(process.cwd(), "pdf-output");

export async function GET() {
  try {
    if (!fs.existsSync(ENERGY_OUTPUT_DIR)) {
      return NextResponse.json(
        { ok: false, message: "Energy audit data not found. Please run the extraction script first." },
        { status: 404 }
      );
    }

    const files = fs.readdirSync(ENERGY_OUTPUT_DIR);
    const csvFiles = files
      .filter((f) => f.startsWith("energy_table_") && f.endsWith(".csv"))
      .sort();

    const tables: Array<{ filename: string; page?: number; index?: number; preview: string[][] }> = [];

    for (const filename of csvFiles) {
      // Load all extracted CSV files
      const filePath = path.join(ENERGY_OUTPUT_DIR, filename);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").filter((l) => l.trim());
      const preview = lines.slice(0, 10).map((line) => {
        // Simple CSV parsing (handle quoted values)
        const values: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
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
        if (current) values.push(current.trim());
        return values;
      });

      // Extract page number from filename: energy_table_page{N}_{index}.csv
      const match = filename.match(/page(\d+)_(\d+)/);
      const page = match ? parseInt(match[1], 10) : undefined;
      const index = match ? parseInt(match[2], 10) : undefined;

      tables.push({
        filename,
        page,
        index,
        preview,
      });
    }

    return NextResponse.json({
      ok: true,
      tables,
      totalFiles: csvFiles.length,
    });
  } catch (error) {
    console.error("Error reading energy audit data:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to read energy audit data" },
      { status: 500 }
    );
  }
}
