"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import {
  IconX,
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconUpload,
  IconChevronRight,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import Map from "@/components/Map";
import { useSession } from "next-auth/react";

const severityMapping: Record<string, string> = {
  EXTREME: "#DC3545",
  HIGH: "#FD7E14",
  MEDIUM: "#FFC107",
  LOW: "#28A745",
};

const HazardForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewIncidentReport>();

  const [date, setDate] = useState<Date | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>({
    latitude: -34.405,
    longitude: 150.644,
  });

  const [images, setImages] = useState<{ id: string; url: string }[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  // const uploadMedia = api.media.uploadMedia.useMutation();
  const router = useRouter();
  const reportIncident = api.incidents.reportIncident.useMutation();
  const session = useSession();
  const onSubmit: SubmitHandler<NewIncidentReport> = async (data) => {
    if (!data || !location) {
      toast.error("Missing required data: location or images");
      return;
    }

    const incidentData: NewIncidentReport = {
      incidentTitle: data.incidentTitle ?? "",
      generalHazardDescription: data.generalHazardDescription ?? "",
      incidentDescription: data.incidentDescription ?? "",
      // incidentReportDescription: data.description ?? "",
      coordinates: `${location.latitude}, ${location.longitude}`,
      incidentType: data.incidentType ?? "",
      hazardType: data.hazardType ?? "",
      status: "INITIATED",
      severity: selectedSeverity ?? "LOW",
      media: images.map((image) => image.id).filter(Boolean),
    };

    try {
      await reportIncident.mutateAsync(incidentData);
      toast.success("Incident reported successfully!");
      router.push("/home");
    } catch (error) {
      console.error("Error reporting incident:", error);
      toast.error("Failed to report incident");
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const files = Array.from(e.target.files);
      console.log("Selected files:", files);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/media`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session?.data?.user.token}`,
            },
            body: formData,
          },
        );

        const result = (await response.json()) as UploadMediaApiResponse;

        if (!response.ok) {
          throw new Error(result.message || "Failed to upload files");
        }

        const uploadedImages =
          result?.fileUrls?.map((img: FileUrl) => ({
            id: img.file.id,
            url: img.file.url,
          })) || [];

        setImages((prev) => [...prev, ...uploadedImages]);
        toast.success("Images uploaded successfully!");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Image upload failed.");
      }
    }
  };

  return (
    <div className="flex flex-col p-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block pb-1 text-sm font-medium text-gray-700">
                Incident title
              </label>
              <input
                {...register("incidentTitle", {
                  required: "Incident title is required",
                })}
                className="w-full rounded-lg border border-gray-300 p-3"
                type="text"
                placeholder="Enter incident title"
              />
              {errors.incidentTitle && (
                <p className="text-sm text-red-500">
                  {errors?.incidentTitle?.message ?? ""}
                </p>
              )}
            </div>

            <div>
              <label className="block pb-1 text-sm font-medium text-gray-700">
                Hazard Type
              </label>
              <select
                {...register("hazardType", {
                  required: "Hazard type is required",
                })}
                className="w-full rounded-lg border border-gray-300 p-3"
              >
                <option value="">Select a hazard type</option>
                <option value="Fire">Fire</option>
                <option value="Chemical">Chemical</option>
                <option value="Electrical">Electrical</option>
                <option value="Structural">Structural</option>
              </select>
              {errors.hazardType && (
                <p className="text-sm text-red-500">
                  {errors?.hazardType?.message ?? ""}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block pb-1 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("incidentDescription", {
                required: "Incident Description is required",
              })}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Describe the hazard"
            />
            {errors.incidentDescription && (
              <p className="text-sm text-red-500">
                {errors.incidentDescription?.message ?? ""}
              </p>
            )}
          </div>

          {/* Severity */}
          <div>
            <label className="block pb-1 text-sm font-medium text-gray-700">
              Severity
            </label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(severityMapping).map(([key, color]) => (
                <div
                  key={key}
                  className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg p-4 text-center font-medium text-gray-800 shadow-sm transition-all duration-150 hover:shadow-md`}
                  style={{
                    backgroundColor:
                      selectedSeverity === key ? `${color}22` : "#F2F2F2",
                    borderColor:
                      selectedSeverity === key ? color : "transparent",
                  }}
                  onClick={() => setSelectedSeverity(key)}
                >
                  {/* Exclamation Mark Icon */}
                  <div className="">
                    <IconAlertTriangleFilled
                      size={25} // Icon size
                      color={color} // Icon color based on selection
                    />
                  </div>

                  {/* Check Icon if selected */}
                  {selectedSeverity === key && (
                    <IconCircleCheckFilled
                      className="absolute right-2 top-2 h-5 w-5"
                      color={color}
                      stroke={2.5}
                    />
                  )}

                  {/* Severity Text */}
                  <span className="block">
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Date */}
          {/* <div>
            <label className="block pb-1 text-sm font-medium text-gray-700">
              Date of Incident
            </label>
            <DatePicker
              selected={date}
              onChange={(selectedDate) => {
                setDate(selectedDate);
                setValue("incidentDate", selectedDate, {
                  shouldValidate: true,
                });
              }}
              className="z-10 w-full rounded-lg border border-gray-300 p-3"
              placeholderText="Select date"
              calendarClassName="z-50"
            />
          </div> */}

          {/* Location */}
          <div className="relative z-0 mt-4 h-60 overflow-hidden rounded-md border">
            <Map
              height={240}
              coordinates={location}
              onLocationSelect={(coords) => setLocation(coords)}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block pb-1 text-sm font-medium text-gray-700">
              Upload Images
            </label>
            <div className="mt-2 flex items-center gap-3">
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-gray-400 bg-white shadow-2xl">
                <IconUpload size={32} />
                <input
                  type="file"
                  accept="image/*"
                  multiple // Add the "multiple" attribute here
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-24 w-24 overflow-visible rounded-2xl bg-gray-100 p-1 shadow-lg"
                >
                  <IconX
                    size={16}
                    className="absolute -right-1 -top-1 cursor-pointer rounded-full bg-white p-0.5 text-red-500 hover:bg-red-50"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                  />
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={`uploaded-${idx}`}
                      className="h-full w-full rounded-xl object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-700">
                      {img.id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex w-full justify-start gap-4">
            <Button
              variant="secondary"
              title="Back"
              onClick={() => router.back()}
            />
            <Button
              type="submit"
              variant="primary"
              title="Submit"
              icon={<IconChevronRight />}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default HazardForm;
