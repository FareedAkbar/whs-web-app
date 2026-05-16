"use client";

import { useMemo, useState } from "react";
import { IconCheck, IconPhoto, IconSearch, IconX } from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import { api } from "@/trpc/react";
import type { MediaItem, SelectedMedia } from "@/types/media";
import { getMediaUrl } from "@/types/media";

interface AppGalleryModalProps {
  open: boolean;
  selectedIds?: string[];
  onClose: () => void;
  onSelect: (items: SelectedMedia[]) => void;
}

export default function AppGalleryModal({
  open,
  selectedIds = [],
  onClose,
  onSelect,
}: AppGalleryModalProps) {
  const [selected, setSelected] = useState<SelectedMedia[]>([]);
  const { data, isLoading } = api.media.getMedia.useQuery(undefined, {
    enabled: open,
  });

  const media = data?.data ?? [];

  const toggleItem = (item: MediaItem) => {
    const url = getMediaUrl(
      item,
      process.env.NEXT_PUBLIC_MEDIA_URL ?? process.env.NEXT_PUBLIC_BASE_URL,
    );

    setSelected((prev) =>
      prev.some((selectedItem) => selectedItem.id === item.id)
        ? prev.filter((selectedItem) => selectedItem.id !== item.id)
        : [
            ...prev,
            {
              id: item.id,
              url,
              name: item.displayName ?? item.originalname ?? item.filename,
            },
          ],
    );
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-white">
        <div className="flex flex-col gap-3 border-b p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Select from app gallery</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose existing media already uploaded in this web app.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-2 rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:static"
            aria-label="Close gallery"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="custom-scrollbar min-h-[320px] flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
            </div>
          ) : media.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {media.map((item) => {
                const url = getMediaUrl(
                  item,
                  process.env.NEXT_PUBLIC_MEDIA_URL ??
                    process.env.NEXT_PUBLIC_BASE_URL,
                );
                const isSelected = selected.some(
                  (selectedItem) => selectedItem.id === item.id,
                );

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border bg-gray-100 text-left shadow-sm transition dark:border-gray-700 dark:bg-gray-800 ${
                      isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
                    }`}
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={item.displayName ?? item.originalname ?? "Media"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <IconPhoto size={34} />
                      </div>
                    )}

                    {isSelected && (
                      <span className="absolute right-2 top-2 rounded-full bg-primary p-1 text-white">
                        <IconCheck size={16} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <IconPhoto size={44} />
              <p className="mt-2 text-sm">No media found.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selected.length} selected
          </p>
          <div className="flex gap-3">
            <Button title="Cancel" variant="secondary" onClick={handleClose} />
            <Button
              title="Add selected"
              disabled={selected.length === 0}
              onClick={() => {
                onSelect(selected);
                handleClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
