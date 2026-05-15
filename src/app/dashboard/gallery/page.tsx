"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  IconCamera,
  IconPhoto,
  IconPhotoUp,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import CameraCaptureModal from "@/components/media/CameraCaptureModal";
import { api } from "@/trpc/react";
import type { FileUrl, MediaItem } from "@/types/media";
import { getMediaUrl } from "@/types/media";
import { Loader } from "lucide-react";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function GalleryPage() {
  const utils = api.useUtils();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data, isLoading, isFetching, refetch } =
    api.media.getMedia.useQuery();
  const uploadMedia = api.media.uploadMedia.useMutation();
  const { mutateAsync: deleteMedia, isPending: isDeleting } =
    api.media.deleteMedia.useMutation();

  const media = data?.data ?? [];

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    toast.info("Uploading media...");

    try {
      const encodedFiles = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type || "image/jpeg",
          dataUrl: await fileToDataUrl(file),
        })),
      );
      const response = await uploadMedia.mutateAsync({ files: encodedFiles });

      if (!response.status) {
        throw new Error(response.error || "Media upload failed.");
      }

      await utils.media.getMedia.invalidate();
      const count = response.data?.length ?? 0;
      toast.success(`${count} image${count === 1 ? "" : "s"} uploaded.`);
      refetch();
    } catch (error) {
      console.error("Gallery upload failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Media upload failed.",
      );
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await deleteMedia({ id });
      if (!response.status) {
        throw new Error(response.error || "Failed to delete media.");
      }
      await utils.media.getMedia.invalidate();
      toast.success("Media deleted successfully.");
    } catch (error) {
      console.error("Delete media failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete media.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 px-4 py-5 sm:px-8">
      <div className="rounded-lg border bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:shadow-gray-700">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Gallery
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload, capture, browse, and manage app media.
            </p>
          </div>

          <div className="flex flex-row justify-between gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                void uploadFiles(Array.from(event.target.files ?? []));
                event.currentTarget.value = "";
              }}
              className="hidden"
            />
            <Button
              title="Upload"
              icon={<IconPhotoUp size={16} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMedia.isPending}
              loading={uploadMedia.isPending}
            />
            <Button
              title="Camera"
              variant="secondary"
              icon={<IconCamera size={16} />}
              onClick={() => setCameraOpen(true)}
              disabled={uploadMedia.isPending}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[55vh] items-center justify-center">
          <div className="h-24 w-24 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {media.map((item: MediaItem) => {
            const url = getMediaUrl(
              item,
              process.env.NEXT_PUBLIC_MEDIA_URL ??
                process.env.NEXT_PUBLIC_BASE_URL,
            );
            const title =
              item.displayName ?? item.originalname ?? item.filename;

            return (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg border bg-gray-100 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-700"
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={title ?? "Media"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                    <IconPhoto size={32} />
                  </div>
                )}

                {/* Delete button — always visible, top-right */}
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500/20 disabled:opacity-50 dark:bg-black/50 dark:hover:bg-red-500/20"
                  aria-label="Delete media"
                >
                  {isDeleting && deletingId === item.id ? (
                    <Loader size={13} className="animate-spin" color="red" />
                  ) : (
                    <IconTrash size={13} color="red" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[55vh] flex-col items-center justify-center rounded-lg border bg-white text-center shadow dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          <IconPhoto size={52} className="text-gray-400" />
          <h2 className="mt-3 font-semibold">No media found</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload from your device or capture a new image with the camera.
          </p>
        </div>
      )}

      {isFetching && !isLoading && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Refreshing gallery...
        </p>
      )}

      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => void uploadFiles([file])}
      />
    </div>
  );
}
