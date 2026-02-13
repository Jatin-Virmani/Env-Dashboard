"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type EnergyTable = {
  filename: string;
  page?: number;
  index?: number;
  preview: string[][];
};

export function EnergyAuditClient() {
  const [tables, setTables] = React.useState<EnergyTable[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedPage, setSelectedPage] = React.useState<number | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 30;

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/pdf-data/energy");
        const json = (await res.json()) as
          | { ok: true; tables: EnergyTable[]; totalFiles: number }
          | { ok: false; message: string };

        if (!res.ok || !json.ok) {
          setError("message" in json ? json.message : "Failed to load energy audit data");
          return;
        }

        setTables(json.tables);
      } catch (err) {
        setError("Failed to load energy audit data");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const filtered = React.useMemo(() => {
    let result = tables;
    if (searchTerm) {
      result = result.filter((t) => t.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedPage !== null) {
      result = result.filter((t) => t.page === selectedPage);
    }
    return result;
  }, [tables, searchTerm, selectedPage]);

  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const pages = React.useMemo(() => {
    const pageSet = new Set<number>();
    tables.forEach((t) => {
      if (t.page !== undefined) pageSet.add(t.page);
    });
    return Array.from(pageSet).sort((a, b) => a - b);
  }, [tables]);

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-neutral-100),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-200),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-neutral-900),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-800),transparent_60%)]" />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
          <div className="flex h-96 items-center justify-center">
            <div className="text-muted-foreground">Loading energy audit data...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-neutral-100),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-200),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-neutral-900),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-800),transparent_60%)]" />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Make sure you've run the extraction script: <code className="rounded bg-muted px-1">python scripts\extract_reports.py</code>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-neutral-100),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-200),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-neutral-900),transparent_55%),radial-gradient(ellipse_at_bottom,var(--color-neutral-800),transparent_60%)]" />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        <div className="animate-in fade-in slide-in-from-top-2 flex flex-col items-start justify-between gap-4 duration-300 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-muted-foreground">PDF Reports</div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Energy Audit Tables</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Energy audit data extracted from PDF reports. View monthly energy consumption, savings, and performance metrics.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            <Button asChild variant="outline">
              <Link href="/">Back to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/thermography">Thermography</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Extracted Tables</CardTitle>
            <CardDescription>
              {tables.length} tables extracted from energy audit PDF (all pages processed). Tables are organized by page number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search tables by filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedPage === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPage(null);
                    setCurrentPage(1);
                  }}
                >
                  All Pages
                </Button>
                {pages.slice(0, 20).map((page) => (
                  <Button
                    key={page}
                    variant={selectedPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedPage(selectedPage === page ? null : page);
                      setCurrentPage(1);
                    }}
                  >
                    Page {page}
                  </Button>
                ))}
                {pages.length > 20 && <Badge variant="outline">+{pages.length - 20} more</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {paginated.length} of {filtered.length} tables (page {currentPage} of {totalPages || 1})
            </p>
            {filtered.length > itemsPerPage && (
              <Badge variant="outline">Use filters or pagination to navigate</Badge>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginated.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No tables found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((table) => (
              <Card key={table.filename}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{table.filename}</CardTitle>
                    {table.page !== undefined && (
                      <Badge variant="outline">Page {table.page}</Badge>
                    )}
                  </div>
                  {table.index !== undefined && (
                    <CardDescription>Table index: {table.index}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        {table.preview[0] && (
                          <TableRow>
                            {table.preview[0].map((header, idx) => (
                              <TableHead key={idx} className="text-xs">
                                {header.substring(0, 15)}
                                {header.length > 15 ? "..." : ""}
                              </TableHead>
                            ))}
                          </TableRow>
                        )}
                      </TableHeader>
                      <TableBody>
                        {table.preview.slice(1, 6).map((row, rowIdx) => (
                          <TableRow key={rowIdx}>
                            {row.map((cell, cellIdx) => (
                              <TableCell key={cellIdx} className="text-xs">
                                {String(cell).substring(0, 20)}
                                {String(cell).length > 20 ? "..." : ""}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Showing preview ({table.preview.length} rows). Full data available in CSV file.
                  </p>
                </CardContent>
              </Card>
            ))
          )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Energy Audit Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              These tables were extracted from the energy audit PDF report. Each table contains structured data about:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Monthly electricity consumption</li>
              <li>Solar generation metrics</li>
              <li>Energy savings calculations</li>
              <li>Performance indicators</li>
            </ul>
            <p className="pt-2">
              Full CSV files are available in the <code className="rounded bg-muted px-1">pdf-output/</code> directory.
              You can import these into Excel, databases, or other analysis tools.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
