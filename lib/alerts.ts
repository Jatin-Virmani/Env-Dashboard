import { Row } from "@/components/dashboard/types";

export type Alert = {
  id: string;
  message: string;
  type: "warning" | "info" | "success";
};

/**
 * Generate alerts based on filtered dashboard data
 */
export function generateAlerts(rows: Row[]): Alert[] {
  const alerts: Alert[] = [];

  const totalWaste = rows.reduce(
    (acc, r) => acc + (r.wetWasteKg ?? 0) + (r.brownWasteKg ?? 0),
    0
  );

  const totalHarvest = rows.reduce((acc, r) => acc + (r.harvestKg ?? 0), 0);

  // Alert: CO2e reduction / Harvest too low
  if (totalHarvest < 100) { // threshold example
    alerts.push({
      id: "low-harvest",
      message: "Total harvest is below threshold (100 Kg).",
      type: "warning",
    });
  }

  // Alert 3: Excessive waste (optional)
  if (totalWaste > 5000) { // example threshold
    alerts.push({
      id: "high-waste",
      message: "Total waste exceeds 5000 Kg. Consider reviewing operations.",
      type: "info",
    });
  }

  return alerts;
}
