"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, generateAlerts } from "@/lib/alerts";
import { Row } from "@/components/dashboard/types";


interface AlertsPanelProps {
  rows: Row[];
}

export default function AlertsPanel({ rows }: AlertsPanelProps) {
  const alerts = React.useMemo(() => generateAlerts(rows), [rows]);

  if (!alerts.length) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={`inline-flex max-w-md items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${alert.type === "warning"
              ? "border-amber-400/70 bg-amber-50/90 text-amber-900 dark:border-amber-500/70 dark:bg-amber-950/60"
              : alert.type === "info"
                ? "border-sky-400/70 bg-sky-50/90 text-sky-900 dark:border-sky-500/70 dark:bg-sky-950/60"
                : "border-emerald-400/70 bg-emerald-50/90 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/60"
            }`}
        >
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs dark:bg-black/40">
            {alert.type === "warning" ? "!" : alert.type === "info" ? "i" : "✓"}
          </div>
          <CardContent className="p-0">
            <div className="flex flex-col gap-0.5">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {alert.type === "warning"
                  ? "Warning"
                  : alert.type === "info"
                    ? "Info"
                    : "Success"}
              </div>
              <div className="text-[13px] leading-snug text-foreground/90">
                {alert.message}
              </div>
            </div>
          </CardContent>
        </Card>

      ))}
    </div>
  );
}
