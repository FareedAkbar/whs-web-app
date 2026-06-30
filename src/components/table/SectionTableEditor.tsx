"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Table2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/Button";

export interface NewTable {
  name: string;
  columns: string[];
}

interface SectionTableEditorProps {
  tables: NewTable[];
  onChange: (tables: NewTable[]) => void;
}

export default function SectionTableEditor({
  tables,
  onChange,
}: SectionTableEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addTable = () => {
    const next = [...tables, { name: "", columns: [""] }];
    onChange(next);
    setExpandedIndex(next.length - 1); // auto-open the new table
  };

  const removeTable = (tIdx: number) => {
    onChange(tables.filter((_, i) => i !== tIdx));
    if (expandedIndex === tIdx) setExpandedIndex(null);
  };

  const updateTableName = (tIdx: number, name: string) => {
    onChange(tables.map((t, i) => (i === tIdx ? { ...t, name } : t)));
  };

  const addColumn = (tIdx: number) => {
    onChange(
      tables.map((t, i) =>
        i === tIdx ? { ...t, columns: [...t.columns, ""] } : t,
      ),
    );
  };

  const updateColumn = (tIdx: number, cIdx: number, value: string) => {
    onChange(
      tables.map((t, i) =>
        i === tIdx
          ? { ...t, columns: t.columns.map((c, ci) => (ci === cIdx ? value : c)) }
          : t,
      ),
    );
  };

  const removeColumn = (tIdx: number, cIdx: number) => {
    onChange(
      tables.map((t, i) =>
        i === tIdx
          ? { ...t, columns: t.columns.filter((_, ci) => ci !== cIdx) }
          : t,
      ),
    );
  };

  return (
    <div className="mt-4 space-y-3">
      {tables.map((table, tIdx) => {
        const isOpen = expandedIndex === tIdx;
        const isValid = table.name.trim() && table.columns.some((c) => c.trim());

        return (
          <div
            key={tIdx}
            className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60"
          >
            {/* Table header row */}
            <div
              className="flex cursor-pointer items-center gap-3 px-4 py-3"
              onClick={() => setExpandedIndex(isOpen ? null : tIdx)}
            >
              <Table2 size={15} className="shrink-0 text-primary" />
              <span className="flex-1 truncate text-sm font-medium text-gray-800 dark:text-white">
                {table.name.trim() || (
                  <span className="text-gray-400 dark:text-gray-500">
                    Untitled table {tIdx+1}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                {table.columns.filter((c) => c.trim()).length} col
                {table.columns.filter((c) => c.trim()).length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTable(tIdx);
                }}
                className="shrink-0 rounded p-1 text-gray-400 hover:text-red-500"
                title="Remove table"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Expanded editor */}
            {isOpen && (
              <div className="border-t border-gray-200 px-4 pb-4 pt-3 dark:border-gray-700">
                <Input
                  label="Table Name"
                  placeholder='e.g. "Fire Equipment Status"'
                  value={table.name}
                  onChange={(e) => updateTableName(tIdx, e.target.value)}
                  className="mb-4"
                />

                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Columns
                </p>

                <div className="space-y-2">
                  {table.columns.map((col, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2">
                      <GripVertical
                        size={14}
                        className="shrink-0 text-gray-300 dark:text-gray-600"
                      />
                      <Input
                        placeholder={`Column ${cIdx + 1} name`}
                        value={col}
                        onChange={(e) => updateColumn(tIdx, cIdx, e.target.value)}
                      />
                      <button
                        onClick={() => removeColumn(tIdx, cIdx)}
                        disabled={table.columns.length === 1}
                        className="shrink-0 rounded p-1 text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Remove column"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addColumn(tIdx)}
                  className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
                >
                  <Plus size={13} />
                  Add column
                </button>

                {/* Live preview */}
                {isValid && (
                  <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-primary/20 border-b border-gray-500">
                          {table.columns
                            .filter((c) => c.trim())
                            .map((col, ci) => (
                              <th
                                key={ci}
                                className="whitespace-nowrap border-r border-gray-200 px-3 py-2 font-semibold text-gray-700 last:border-r-0 dark:border-gray-700 dark:text-gray-300"
                              >
                                {col}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {table.columns
                            .filter((c) => c.trim())
                            .map((_, ci) => (
                              <td
                                key={ci}
                                className="border-r border-gray-100 px-3 py-2 text-gray-300 last:border-r-0 dark:border-gray-700 dark:text-gray-600"
                              >
                                —
                              </td>
                            ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
<Button title="Add Table" variant="secondary" onClick={addTable} className="mt-4" icon={<Plus size={13} />}/>
      {/* <button
        onClick={addTable}
        className="flex items-center gap-2 rounded-md border border-dashed border-primary/50 px-4 py-2 text-sm text-primary transition hover:border-primary hover:bg-primary/5"
      >
        <Table2 size={15} />
        {tables.length === 0 ? "Add table" : "Add another table"}
      </button> */}
    </div>
  );
}