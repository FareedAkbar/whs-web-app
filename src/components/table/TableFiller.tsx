"use client";

import { Plus, Trash2 } from "lucide-react";

export type TableRow = Record<string, string>;

export interface FilledTable {
  tableId: string;
  rows: TableRow[];
}

interface TableFillerProps {
  tableId: string;
  tableName: string;
  columns: string[];
  rows: TableRow[];
  onChange: (rows: TableRow[]) => void;
}

function makeEmptyRow(columns: string[]): TableRow {
  return Object.fromEntries(columns.map((col) => [col, ""]));
}

export default function TableFiller({
  tableId,
  tableName,
  columns,
  rows,
  onChange,
}: TableFillerProps) {
  const addRow = () => onChange([...rows, makeEmptyRow(columns)]);

  const removeRow = (rIdx: number) =>
    onChange(rows.filter((_, i) => i !== rIdx));

  const updateCell = (rIdx: number, col: string, value: string) =>
    onChange(rows.map((row, i) => (i === rIdx ? { ...row, [col]: value } : row)));

  return (
    <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* ── Header — always full width, never scrolls ── */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/60">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {tableName}
        </p>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {rows.length} row{rows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Scrollable table only ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="whitespace-nowrap border-r border-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 last:border-r-0 dark:border-gray-700 dark:text-gray-400"
                >
                  {col}
                </th>
              ))}
              {/* delete column */}
              <th className="w-8 px-2 py-2" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="border-b border-gray-100 last:border-0 dark:border-gray-700"
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="border-r border-gray-100 px-2 py-1.5 last:border-r-0 dark:border-gray-700"
                  >
                    <input
                      type="text"
                      value={row[col] ?? ""}
                      onChange={(e) => updateCell(rIdx, col, e.target.value)}
                      placeholder="—"
                      className="w-full min-w-[100px] rounded border-0 bg-transparent px-1 py-0.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary/40 dark:text-gray-200 dark:placeholder:text-gray-600"
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => removeRow(rIdx)}
                    disabled={rows.length === 1}
                    className="rounded p-0.5 text-gray-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-20 dark:text-gray-600"
                    title="Remove row"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer — always full width, never scrolls ── */}
      <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-700">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
        >
          <Plus size={13} />
          Add row
        </button>
      </div>
    </div>
  );
}