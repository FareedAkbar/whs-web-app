"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  IconCamera,
  IconPhotoPlus,
  IconPhotoUp,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import { api } from "@/trpc/react";
import type { FileUrl, SelectedMedia } from "@/types/media";
import { getUploadedMediaUrl } from "@/types/media";
import AppGalleryModal from "./AppGalleryModal";
import CameraCaptureModal from "./CameraCaptureModal";

interface MediaPickerProps {
  value: SelectedMedia[];
  onChange: (images: SelectedMedia[]) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function MediaPicker({
  value,
  onChange,
  label = "Images",
  required = false,
  error,
}: MediaPickerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const uploadMedia = api.media.uploadMedia.useMutation();

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;

    const placeholders: SelectedMedia[] = files.map((file, index) => ({
      id: `temp-${file.name}-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    const placeholderIds = new Set(placeholders.map((item) => item.id));
    onChange([...value, ...placeholders]);
    toast.info("Uploading images...");

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
        throw new Error(response.error || "Image upload failed.");
      }

      const uploadedImages =
        response.data?.map((item: FileUrl) => ({
          id: item.file.id,
          url: getUploadedMediaUrl(item),
          name:
            item.file.displayName ??
            item.file.originalname ??
            item.file.filename,
        })) ?? [];

      onChange([
        ...value.filter((item) => !placeholderIds.has(item.id)),
        ...uploadedImages,
      ]);
      toast.success("Images uploaded successfully!");
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);
      onChange(value.filter((item) => !placeholderIds.has(item.id)));
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed.",
      );
    }
  };

  const removeImage = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  return (
    <div>
      <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          void uploadFiles(files);
          event.currentTarget.value = "";
        }}
        className="hidden"
      />

      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button
          title="Device"
          variant="secondary"
          icon={<IconPhotoUp size={16} />}
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          disabled={uploadMedia.isPending}
        />
        <Button
          title="Camera"
          variant="secondary"
          icon={<IconCamera size={16} />}
          onClick={() => setCameraOpen(true)}
          className="w-full"
          disabled={uploadMedia.isPending}
        />
        <Button
          title="From App"
          variant="secondary"
          icon={<IconPhotoPlus size={16} />}
          onClick={() => setGalleryOpen(true)}
          className="w-full"
          disabled={uploadMedia.isPending}
        />
      </div>

      {value.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {value.map((img) => (
            <div
              key={img.id}
              className="relative h-24 w-24 overflow-hidden rounded-lg border bg-gray-100 shadow dark:border-gray-700 dark:bg-gray-700"
            >
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute right-1 top-1 z-10 rounded-full bg-white p-1 text-red-500 shadow hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/60"
                aria-label="Remove image"
              >
                <IconX size={14} />
              </button>
              {img.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.url}
                  alt={img.name ?? img.id}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <IconTrash size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => void uploadFiles([file])}
      />

      <AppGalleryModal
        open={galleryOpen}
        selectedIds={value.map((item) => item.id)}
        onClose={() => setGalleryOpen(false)}
onSelect={(items) => {
  const existingIds = new Set(value.map((item) => item.id));
  const newItems = items.filter((item) => !existingIds.has(item.id));
  onChange([...value, ...newItems]);
}}      />
    </div>
  );
}
