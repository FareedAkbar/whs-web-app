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
  const [query, setQuery] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data, isLoading, isFetching, refetch } =
    api.media.getMedia.useQuery();
  const uploadMedia = api.media.uploadMedia.useMutation();
  const { mutateAsync: deleteMedia, isPending: isDeleting } =
    api.media.deleteMedia.useMutation();

  const media = useMemo(() => {
    return (data?.data ?? []).filter((item: MediaItem) => {
      const text = `${item.displayName ?? ""} ${item.originalname ?? ""} ${item.filename ?? ""}`;
      return text.toLowerCase().includes(query.toLowerCase());
    });
  }, [data?.data, query]);

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

          <div className="flex flex-col gap-3 sm:flex-row">
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

        <div className="mt-5 flex items-center rounded-md border bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-700">
          <IconSearch size={18} className="text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search gallery..."
            className="w-full bg-transparent px-2 text-sm outline-none dark:text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[55vh] items-center justify-center">
          <div className="h-24 w-24 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((item) => {
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
                className="overflow-hidden rounded-lg border bg-white shadow-md transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:shadow-gray-700"
              >
                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={title ?? "Media"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <IconPhoto size={42} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {title ?? "Untitled media"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.mimetype ?? "Image"}
                      {item.size ? ` - ${item.size}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="rounded-full p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/40"
                    aria-label="Delete media"
                  >
                    {isDeleting && deletingId === item.id ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <IconTrash size={18} />
                    )}
                  </button>
                </div>
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
