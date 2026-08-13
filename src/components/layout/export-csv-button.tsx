"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, rowsToCsv, type CsvRow } from "@/lib/csv";

type CsvData = { headers: string[]; rows: CsvRow[] };

export function ExportCsvButton({
  filename,
  data,
}: {
  filename: string;
  data: CsvData | (() => CsvData);
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        const { headers, rows } = typeof data === "function" ? data() : data;
        downloadCsv(filename, rowsToCsv(headers, rows));
      }}
    >
      <Download />
      Export CSV
    </Button>
  );
}
