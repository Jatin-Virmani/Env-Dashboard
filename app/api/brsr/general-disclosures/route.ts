import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { BRSRGeneralDisclosures } from "@/lib/brsr/types";

export const runtime = "nodejs";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<BRSRGeneralDisclosures> & { companyId: string };
    const {
      companyId,
      cin,
      name,
      yearOfIncorporation,
      registeredOfficeAddress,
      corporateAddress,
      email,
      telephone,
      website,
      financialYear,
      stockExchanges,
      paidUpCapital,
      contactPersonName,
      contactPersonTelephone,
      contactPersonEmail,
      reportingBoundary,
    } = body;

    if (!companyId) {
      return jsonError("companyId is required", 400);
    }

    // Upsert company if needed
    const company = await db.bRSRCompany.upsert({
      where: { id: companyId },
      update: {
        cin: cin ?? undefined,
        name: name ?? undefined,
        updatedAt: new Date(),
      },
      create: {
        id: companyId,
        cin: cin ?? "",
        name: name ?? "",
      },
    });

    // Upsert general disclosures
    const disclosures = await db.bRSRGeneralDisclosures.upsert({
      where: { companyId },
      update: {
        cin: cin ?? undefined,
        name: name ?? undefined,
        yearOfIncorporation: yearOfIncorporation ? parseInt(String(yearOfIncorporation), 10) : undefined,
        registeredOfficeAddress: registeredOfficeAddress ?? undefined,
        corporateAddress: corporateAddress ?? undefined,
        email: email ?? undefined,
        telephone: telephone ?? undefined,
        website: website ?? undefined,
        financialYear: financialYear ?? undefined,
        stockExchanges: stockExchanges ?? undefined,
        paidUpCapital: paidUpCapital ? parseFloat(String(paidUpCapital)) : undefined,
        contactPersonName: contactPersonName ?? undefined,
        contactPersonTelephone: contactPersonTelephone ?? undefined,
        contactPersonEmail: contactPersonEmail ?? undefined,
        reportingBoundary: reportingBoundary ?? undefined,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        cin: cin ?? "",
        name: name ?? "",
        yearOfIncorporation: yearOfIncorporation ? parseInt(String(yearOfIncorporation), 10) : 2000,
        registeredOfficeAddress: registeredOfficeAddress ?? "",
        corporateAddress: corporateAddress ?? "",
        email: email ?? "",
        telephone: telephone ?? "",
        website: website ?? "",
        financialYear: financialYear ?? "",
        stockExchanges: stockExchanges ?? "",
        paidUpCapital: paidUpCapital ? parseFloat(String(paidUpCapital)) : 0,
        contactPersonName: contactPersonName ?? "",
        contactPersonTelephone: contactPersonTelephone ?? "",
        contactPersonEmail: contactPersonEmail ?? "",
        reportingBoundary: reportingBoundary ?? "consolidated",
      },
    });

    // Create audit entry
    await db.bRSRAudit.create({
      data: {
        companyId,
        dataPoint: "General Disclosures",
        action: "update",
        newValue: JSON.stringify(disclosures),
        source: "BRSR Dashboard",
      },
    });

    return NextResponse.json({ ok: true, disclosures });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Failed to save General Disclosures", 500);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") ?? "default";

  try {
    const disclosures = await db.bRSRGeneralDisclosures.findUnique({
      where: { companyId },
    });

    return NextResponse.json({ ok: true, disclosures });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Failed to load General Disclosures", 500);
  }
}
