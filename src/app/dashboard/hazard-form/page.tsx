"use client";

import { useContext, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import Button from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { severityMapping } from "@/constants/severity";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/Select";
import { ThemeContext } from "@/providers/ThemeContext";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });
const HazardForm = () => {
  const {
    register,
    handleSubmit,

    reset,
    control,
    formState: { errors },
  } = useForm<NewIncidentReport>();

  // const [date, setDate] = useState<Date | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>({
    latitude: -34.405,
    longitude: 150.644,
  });
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme;
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  // const uploadMedia = api.media.uploadMedia.useMutation();
  const router = useRouter();
  const reportIncident = api.incidents.reportIncident.useMutation();
  const { data: enums } = api.enums.getEnums.useQuery();
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
    console.log("Incident Data:", incidentData);
    try {
      await reportIncident.mutateAsync(incidentData, {
        onSuccess: () => {
          toast.success("Incident reported successfully!");
          router.push("/dashboard/incidents");
          reset({
            incidentTitle: "",
            generalHazardDescription: "",
            incidentDescription: "",
            incidentReportDescription: "",
          });
        },
        onError: (error) => {
          console.error("Error reporting incident:", error);
          toast.error("Failed to report incident");
        },
      });

      // await reportIncident.mutateAsync(incidentData);
    } catch (error) {
      console.error("Error reporting incident:", error);
      toast.error("Failed to report incident");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const files = Array.from(e.target.files);

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
      <div className="rounded-lg bg-white p-6 shadow dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:shadow-gray-700">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Controller
                name="reportTitle"
                control={control}
                rules={{ required: "Incident title is required" }}
                render={({ field }) => (
                  <Input
                    type="text"
                    label="Incident Title"
                    placeholder="Enter incident title"
                    error={errors.reportTitle?.message}
                    {...field} // includes value, onChange, ref
                  />
                )}
              />
              {/* <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Incident title
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 p-3"
                type="text"
                placeholder="Enter incident title"
                {...register("incidentTitle", {
                  required: "Incident title is required",
                })}
              />
              {errors.incidentTitle && (
                <p className="text-sm text-red-500">
                  {errors?.incidentTitle?.message ?? ""}
                </p>
              )} */}
            </div>

            <div>
              {/* <Select
                label="Hazard Type"
                options={
                  enums?.data?.GeneralHazardTypes.map((hazard) => ({
                    label: hazard,
                    value: hazard,
                  })) ?? []
                }
                // placeholder="Select a hazard type"
                error={errors.hazardType?.message}
                {...register("hazardType", {
                  required: "Hazard type is required",
                })}
              /> */}
              {/* <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Hazard Type
              </label>
              <select
                {...register("hazardType", {
                  required: "Hazard type is required",
                })}
                className="w-full rounded-lg border border-gray-300 p-3"
              >
                <option value="">Select a hazard type</option>
                {enums?.data?.GeneralHazardTypes.map((hazard) => (
                  <option key={hazard} value={hazard}>
                    {hazard}
                  </option>
                ))}
              </select>
              {errors.hazardType && (
                <p className="text-sm text-red-500">
                  {errors?.hazardType?.message ?? ""}
                </p>
              )} */}
            </div>
            <div>
              <Select
                label="Incident Type"
                options={
                  Object.values(IncidentCategoryType).map((incident) => ({
                    label: incident,
                    value: incident,
                  })) ?? []
                }
                // placeholder="Select an incident type"
                error={errors.categoryType?.message}
                {...register("categoryType", {
                  required: "Incident type is required",
                })}
              />
              {/* <label className="pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Incident Type
              </label>
              <select
                {...register("incidentType", {
                  required: "Incident type is required",
                })}
                className="w-full rounded-lg border border-gray-300 p-3"
              >
                <option value="">Select an incident type</option>
                {enums?.data?.IncidentTypes.map((incident) => (
                  <option key={incident} value={incident}>
                    {incident}
                  </option>
                ))}
              </select>
              {errors.incidentType && (
                <p className="text-sm text-red-500">
                  {errors?.incidentType?.message ?? ""}
                </p>
              )} */}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Description */}
            <div>
              <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Incident Description
              </label>
              <textarea
                {...register("incidentDescription", {
                  required: "Incident Description is required",
                })}
                className={`shadow-input dark:placeholder-text-neutral-600 duration-400 flex w-full rounded-md border bg-gray-50 p-3 text-black transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:bg-gray-700 dark:text-white`}
                placeholder="Describe the incident"
              />
              {errors.incidentDescription && (
                <p className="text-sm text-red-500">
                  {errors.incidentDescription?.message ?? ""}
                </p>
              )}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Severity
            </label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(severityMapping).map(([key, color]) => {
                const isSelected = selectedSeverity === key;

                return (
                  <div
                    key={key}
                    className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg p-4 text-center font-medium shadow-sm transition-all duration-150 hover:shadow-md ${isSelected ? "border" : "border border-transparent"} "text-gray-800 dark:text-gray-200" ${!isSelected ? "bg-[#F2F2F2] dark:bg-gray-700" : ""} `}
                    style={{
                      backgroundColor: isSelected
                        ? `${color}${theme === "dark" ? "33" : "22"}`
                        : undefined,
                      borderColor: isSelected ? color : "transparent",
                    }}
                    onClick={() => setSelectedSeverity(key)}
                  >
                    {/* Exclamation Mark Icon */}
                    <IconAlertTriangleFilled size={25} color={color} />

                    {/* Check Icon */}
                    {isSelected && (
                      <IconCircleCheckFilled
                        className="absolute right-2 top-2 h-5 w-5"
                        color={color}
                        stroke={2.5}
                      />
                    )}

                    {/* Label */}
                    <span className="block">
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date */}
          {/* <div>
            <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload Images
            </label>
            <div className="mt-2 flex items-center gap-3">
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-gray-400 bg-white shadow-2xl dark:bg-gray-700">
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
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-700 dark:text-gray-300">
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
              icon={<IconChevronRight size={12} />}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default HazardForm;
