"use client";

import { useMemo, useState } from "react";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import { severityMapping } from "@/constants/severity";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { NewHazardReport } from "@/types/report";
import MediaPicker from "@/components/media/MediaPicker";
import type { SelectedMedia } from "@/types/media";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });
const HazardForm = () => {
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
  // const [date, setDate] = useState<Date | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>({
    latitude: -34.405,
    longitude: 150.644,
  });
  const [images, setImages] = useState<SelectedMedia[]>([]);
  // const uploadMedia = api.media.uploadMedia.useMutation();
  const router = useRouter();
  const reportHazard = api.incidents.reportHazard.useMutation();
  const handleLocationSelect = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setLocation(coords);
  };
  const onSubmit: SubmitHandler<NewHazardReport> = async (data) => {
    if (!data || !location) {
      toast.error("Missing required data: location or images");
      return;
    }

    const hazardData: NewHazardReport = {
      reportTitle: data.reportTitle,
      reportDescription: data.reportDescription,
      hazardDescription: data.hazardDescription,
      status: "INITIATED",
      severity: data.severity,
      mainType: "HAZARD",
      coordinates:
        location?.latitude && location?.longitude
          ? `${location.latitude},${location.longitude}`
          : "",

      media: images.map((image) => image.id).filter(Boolean),
      managerSignatureConfirmationDate: null, // or a valid date if available
      dynamicQuestion: [], // or appropriate value if available
      categoryType: data.categoryType,
    };

    try {
      await reportHazard.mutateAsync(hazardData, {
        onSuccess: () => {
          toast.success("Hazard reported successfully!");
          router.push("/dashboard/hazards");
          // reset({
          //   incidentTitle: "",
          //   generalHazardDescription: "",
          //   hazardDescription: "",
          //   incidentReportDescription: "",
          // });
        },
        onError: (error) => {
          console.error("Error reporting hazard:", error);
          toast.error("Failed to report hazard");
        },
      });

      // await reportIncident.mutateAsync(hazardData);
    } catch (error) {
      console.error("Error reporting hazard:", error);
      toast.error("Failed to report hazard");
    }
  };

  return (
    <div className="flex flex-col p-6">
      <div className="rounded-lg bg-white p-6 shadow dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:shadow-gray-700">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* first row: title, hazard/incident type, incident type */}
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
              <div className="min-w-[280px] flex-1">
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
              </div>

              <div className="min-w-[280px] flex-1">
                <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Detailed Hazard Description
                </label>
                <Controller
                  name="hazardDescription"
                  control={control}
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

            {/* Severity selection (grid of buttons) */}
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

                      return (
                        <div
                          key={key}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            field.onChange(key);
                          }}
                          className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-50 p-4 text-center font-medium shadow-md transition-all duration-150 dark:bg-gray-700 ${
                            isSelected ? "border" : "border border-transparent"
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
                          <span className="mt-2 block">
                            {key.charAt(0) + key.slice(1).toLowerCase()}
                          </span>
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

            {/* Map (location) */}
            <div className="relative z-0 mt-4 h-60 overflow-hidden rounded-md border">
              <Map
                height={240}
                coordinates={location}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            {/* Image Upload */}
            <Controller
              name="media"
              control={control}
              rules={{
                required: "At least one image is required.",
                validate: (value) =>
                  (value && value.length > 0) ||
                  "Please upload at least one image.",
              }}
              render={({ field }) => (
                <div>
                  <MediaPicker
                    value={images}
                    onChange={(updatedImages) => {
                      setImages(updatedImages);
                      field.onChange(updatedImages);
                    }}
                    required
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
                title={"Submit"}
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

export default HazardForm;
