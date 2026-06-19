"use client";

import { useMemo, useState } from "react";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import {
  severityMapping,
  severityDisplayMapping,
  severityDescriptionMapping,
} from "@/constants/severity";
import { Input } from "@/components/ui/input";
import { NewHazardReport } from "@/types/report";
import MediaPicker from "@/components/media/MediaPicker";
import type { SelectedMedia } from "@/types/media";

// const Map = dynamic(() => import("@/components/Map"), { ssr: false });
const HazardForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectionId = searchParams.get("inspectionId");
  const inspectionTitle = searchParams.get("inspectionTitle");

  const methods = useForm<NewHazardReport>({
    defaultValues: {
      reportTitle: "",
      reportDescription: "",
      hazardDescription: "",
      categoryType: "",
      severity: undefined,
      coordinates: "",
    },
  });
  const { control, handleSubmit, formState } = methods;
  const severityKeys = useMemo(() => Object.keys(severityMapping), []);

  const { errors } = formState;

  // Commented out Map state
  // const [location, setLocation] = useState<{
  //   latitude: number;
  //   longitude: number;
  // } | null>({
  //   latitude: -34.405,
  //   longitude: 150.644,
  // });
  const [images, setImages] = useState<SelectedMedia[]>([]);
  const reportHazard = api.incidents.reportHazard.useMutation();

  // Commented out location select
  // const handleLocationSelect = (coords: {
  //   latitude: number;
  //   longitude: number;
  // }) => {
  //   setLocation(coords);
  // };

  const onSubmit: SubmitHandler<NewHazardReport> = async (data) => {
    if (!data) {
      toast.error("Missing required data");
      return;
    }

    // Append inspection details to the description if prefilled
    let finalDesc = data.hazardDescription;
    if (inspectionId) {
      finalDesc += `\n\n[Inspection Link: ${inspectionId} | ${inspectionTitle || "Inspection Details"}]`;
    }

    const hazardData: NewHazardReport = {
      reportTitle: data.reportTitle,
      reportDescription: data.reportDescription ?? "",
      hazardDescription: finalDesc,
      status: "INITIATED",
      severity: data.severity,
      mainType: "HAZARD",
      coordinates: data.coordinates, // Free text location
      address: data.coordinates,

      media: images.map((image) => image.id).filter(Boolean),
      managerSignatureConfirmationDate: null,
      categoryType: data.categoryType || "HAZARD",
    };

    try {
      await reportHazard.mutateAsync(
        { hazard: hazardData },
        {
          onSuccess: () => {
            toast.success("Hazard reported successfully!");
            router.push("/dashboard/hazards");
          },
          onError: (error) => {
            console.error("Error reporting hazard:", error);
            toast.error("Failed to report hazard");
          },
        },
      );
    } catch (error) {
      console.error("Error reporting hazard:", error);
      toast.error("Failed to report hazard");
    }
  };

  return (
    <div className="flex flex-col p-6">
      {/* Linked Safety Inspection Notice */}
      {inspectionId && (
        <div className="mb-6 rounded-lg border-l-4 border-emerald-400 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950">
          <p className="text-sm text-emerald-700 dark:text-emerald-200">
            <strong>Linked to Safety Inspection:</strong>{" "}
            {inspectionTitle || "Inspection Sheet"} (ID:{" "}
            {inspectionId.substring(0, 8).toUpperCase()})
          </p>
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:shadow-gray-700">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* first row: title */}
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[220px] flex-1">
                <Controller
                  name="reportTitle"
                  control={control}
                  rules={{ required: "Hazard title is required" }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      label="Hazard Title"
                      placeholder="Enter Hazard title"
                      required
                      error={errors.reportTitle?.message}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Description row */}
            <div className="flex flex-wrap gap-4">
              {/* Commented out Report Description (replaced by detailed description) */}
              {/* <div className="min-w-[280px] flex-1">
                <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Report Description <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="reportDescription"
                  control={control}
                  rules={{ required: "General description is required" }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className="w-full rounded-md border bg-gray-50 p-3 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:bg-gray-700 dark:text-white dark:autofill:text-white"
                      placeholder="Describe the hazard (general)"
                      rows={4}
                    />
                  )}
                />
                {errors.reportDescription && (
                  <p className="text-sm text-red-500">
                    {errors.reportDescription.message}
                  </p>
                )}
              </div> */}

              <div className="min-w-[280px] flex-1">
                <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Detailed Hazard Description{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="hazardDescription"
                  control={control}
                  rules={{
                    required: "Detailed hazard description is required",
                  }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className="w-full rounded-md border bg-gray-50 p-3 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:bg-gray-700 dark:text-white dark:autofill:text-white"
                      placeholder="Detailed hazard description"
                      rows={4}
                    />
                  )}
                />
                {errors.hazardDescription && (
                  <p className="text-sm text-red-500">
                    {errors.hazardDescription.message}
                  </p>
                )}
              </div>
            </div>

            {/* Severity selection (grid of buttons with tooltips) */}
            <Controller
              name="severity"
              control={control}
              rules={{ required: "Severity is required" }}
              render={({ field }) => (
                <div>
                  <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {severityKeys.map((key) => {
                      const color = severityMapping[key];
                      const isSelected = field.value === key;
                      const displayName = severityDisplayMapping[key] || key;
                      const description = severityDescriptionMapping[key] || "";

                      return (
                        <div key={key} className="group relative">
                          <div
                            role="button"
                            title={description}
                            tabIndex={0}
                            onClick={() => {
                              field.onChange(key);
                            }}
                            className={`relative flex h-24 w-28 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-50 p-4 text-center font-medium shadow-md transition-all duration-150 dark:bg-gray-700 ${
                              isSelected
                                ? "border"
                                : "border border-transparent"
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? `${color}22`
                                : undefined,
                              borderColor: isSelected ? color : "transparent",
                            }}
                          >
                            <IconAlertTriangleFilled size={25} color={color} />
                            {isSelected && (
                              <IconCircleCheckFilled
                                className="absolute right-2 top-2"
                                color={color}
                              />
                            )}
                            <span className="mt-2 block">{displayName}</span>
                          </div>

                          {/* Hover Tooltip Description */}
                        </div>
                      );
                    })}
                  </div>

                  {errors?.severity && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.severity.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Commented out Map (location) */}
            {/* <div className="relative z-0 mt-4 h-60 overflow-hidden rounded-md border">
              <Map
                height={240}
                coordinates={location}
                onLocationSelect={handleLocationSelect}
              />
            </div> */}

            {/* Location input field */}
            <div className="min-w-[220px] flex-1">
              <Controller
                name="coordinates"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <Input
                    type="text"
                    label="Location"
                    placeholder="E.g. Building 9, Sports Hub"
                    required
                    error={errors.coordinates?.message}
                    {...field}
                  />
                )}
              />
            </div>

            {/* Image Upload (Optional) */}
            <Controller
              name="media"
              control={control}
              render={({ field }) => (
                <div>
                  <MediaPicker
                    value={images}
                    onChange={(updatedImages) => {
                      setImages(updatedImages);
                      field.onChange(updatedImages);
                    }}
                    error={
                      errors.media ? String(errors.media.message) : undefined
                    }
                  />
                </div>
              )}
            />

            {/* Action buttons */}
            <div className="mt-4 flex w-full justify-start gap-4">
              <Button
                variant="secondary"
                title="Back"
                onClick={() => router.back()}
              />
              <Button
                type="submit"
                variant="primary"
                title={"Create Hazard"}
                disabled={reportHazard.isPending}
                loading={reportHazard.isPending}
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

// Export wrapped with Suspense to allow useSearchParams safely
import { Suspense } from "react";
const HazardFormPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <HazardForm />
    </Suspense>
  );
};

export default HazardFormPage;
