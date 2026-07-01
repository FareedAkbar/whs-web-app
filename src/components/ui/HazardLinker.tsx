"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeveritySelector } from "@/components/ui/SeveritySelector";
import MediaPicker from "@/components/media/MediaPicker";
import type { SelectedMedia } from "@/types/media";
import { api } from "@/trpc/react";
import type { NewHazardReport } from "@/types/report";

export interface HazardLinkValue {
  mode: "existing" | "new";
  hazardId?: string;
  newHazard?: Omit<NewHazardReport, "status" | "mainType" | "managerSignatureConfirmationDate">;
}

interface HazardLinkerProps {
  value: HazardLinkValue;
  onChange: (val: HazardLinkValue) => void;
  /** Optional list of already-assigned hazard IDs to exclude */
  excludeHazardIds?: string[];
}

const HazardLinker: React.FC<HazardLinkerProps> = ({
  value,
  onChange,
  excludeHazardIds = [],
}) => {
  const { data: hazardsRes, isLoading: loadingHazards } =
    api.incidents.getHazards.useQuery();
  const hazardsList = hazardsRes?.data ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [hazardImages, setHazardImages] = useState<SelectedMedia[]>([]);

  const filteredHazards = useMemo(
    () =>
      hazardsList.filter((item) => {
        const id = item.hazard?.id ?? "";
        if (excludeHazardIds.includes(id)) return false;
        const title = item.report.title?.toLowerCase() ?? "";
        const desc = (item.hazard?.hazardDescription ?? item.report.description ?? "").toLowerCase();
        const term = searchTerm.toLowerCase();
        return title.includes(term) || desc.includes(term);
      }),
    [hazardsList, excludeHazardIds, searchTerm],
  );

  const setMode = (mode: "existing" | "new") => {
    onChange({ mode, hazardId: undefined, newHazard: undefined });
    setHazardImages([]);
  };

  const setHazardId = (id: string) => {
    onChange({ ...value, hazardId: id });
  };

  const updateNewHazard = (
    patch: Partial<NonNullable<HazardLinkValue["newHazard"]>>,
  ) => {
    onChange({
      ...value,
      newHazard: { ...(value.newHazard ?? {}), ...patch } as HazardLinkValue["newHazard"],
    });
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex flex-wrap gap-4">
        {(["existing", "new"] as const).map((m) => (
          <label
            key={m}
            className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
          >
            <input
              type="radio"
              value={m}
              checked={value.mode === m}
              onChange={() => setMode(m)}
              className="accent-primary"
            />
            {m === "existing" ? "Existing hazard" : "New hazard"}
          </label>
        ))}
      </div>

      {/* Existing hazard picker */}
      {value.mode === "existing" && (
        <div>
          <Input
            placeholder="Search hazards…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />
          {loadingHazards ? (
            <p className="text-sm text-gray-500">Loading hazards…</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredHazards.map((item) => {
                const hazardId = item.hazard?.id ?? "";
                const ticketNumber =
                  item.hazard?.ticket_number ??
                  item.report.ticketNumber ??
                  `HZ-${item.report.id.substring(0, 8).toUpperCase()}`;
                const isSelected = value.hazardId === hazardId;

                return (
                  <button
                    type="button"
                    key={item.report.id}
                    disabled={!hazardId}
                    onClick={() => setHazardId(hazardId)}
                    className={`rounded-lg border p-4 text-left transition ${
                      isSelected
                        ? "border-primary bg-white shadow-md dark:bg-gray-800"
                        : "border-gray-200 bg-white hover:border-primary/60 dark:border-gray-700 dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-primary">
                          Ticket# {ticketNumber}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {item.report.title}
                        </p>
                      </div>
                      <span
                        className={`mt-1 h-4 w-4 rounded-full border ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.hazard?.hazardDescription ||
                        item.report.description ||
                        "No description provided"}
                    </p>
                  </button>
                );
              })}
              {filteredHazards.length === 0 && (
                <p className="col-span-2 rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-300">
                  No hazards found.
                </p>
              )}
            </div>
          )}
          {!value.hazardId && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              Choose one hazard before submitting.
            </p>
          )}
        </div>
      )}

      {/* New hazard form */}
      {value.mode === "new" && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Hazard Title"
              placeholder="Enter hazard title"
              required
              value={value.newHazard?.reportTitle ?? ""}
              onChange={(e) =>
                updateNewHazard({ reportTitle: e.target.value })
              }
            />
            <Input
              label="Hazard Type"
              placeholder="e.g. CHEMICAL"
              value={value.newHazard?.categoryType ?? ""}
              onChange={(e) =>
                updateNewHazard({ categoryType: e.target.value })
              }
            />
            <Input
              label="Hazard Location"
              placeholder="E.g. Building 9, Sports Hub"
              required
              value={value.newHazard?.address ?? ""}
              onChange={(e) => updateNewHazard({ address: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Detailed Hazard Description{" "}
                <span className="text-red-500">*</span>
              </Label>
              <textarea
                className="w-full rounded-md border bg-gray-50 p-3 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white"
                placeholder="Detailed hazard description"
                rows={4}
                value={value.newHazard?.hazardDescription ?? ""}
                onChange={(e) =>
                  updateNewHazard({ hazardDescription: e.target.value })
                }
              />
            </div>
            <SeveritySelector
              label="Hazard Severity"
              value={value.newHazard?.severity ?? ""}
              onChange={(v) => updateNewHazard({ severity: v as any })}
            />
          </div>

          <MediaPicker
            value={hazardImages}
            onChange={(imgs) => {
              setHazardImages(imgs);
              updateNewHazard({ media: imgs.map((i) => i.id).filter(Boolean) as string[] });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default HazardLinker;