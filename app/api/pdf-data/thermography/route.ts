import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const THERMO_DATA_PATH = path.join(process.cwd(), "pdf-output", "thermography_data.json");

export async function GET() {
  try {
    if (!fs.existsSync(THERMO_DATA_PATH)) {
      return NextResponse.json(
        { ok: false, message: "Thermography data not found. Please run the extraction script first." },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(THERMO_DATA_PATH, "utf-8");
    const data = JSON.parse(fileContent);

    return NextResponse.json({
      ok: true,
      records: data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error reading thermography data:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to read thermography data" },
      { status: 500 }
    );
  }
}
