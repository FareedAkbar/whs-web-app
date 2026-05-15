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
import { Select } from "@/components/ui/Select";
import dynamic from "next/dynamic";
import {
  IncidentCategoryType,
  NewIncidentReport,
  treatmentType,
} from "@/types/report";
import MediaPicker from "@/components/media/MediaPicker";
import type { SelectedMedia } from "@/types/media";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });
const HazardForm = () => {
  const methods = useForm<NewIncidentReport>({
    defaultValues: {
      reportTitle: "",
      reportDescription: "",
      incidentDescription: "",
      categoryType: undefined,
      treatmentType: undefined,
      treatmentDescription: "",
      injuredBodyPart: "",
      injuredPersonName: "",
      injuredPhoneNumber: "",
      injuredPersonEmail: "",
      firstAiderName: "",
      firstAiderPhone: "",
      firstAiderEmail: "",
      firstAidDate: "",
      severity: undefined,
      followUp: false,
      coordinates: "",
    },
  });
  const { control, handleSubmit, setValue, watch, formState } = methods;
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
  const reportIncident = api.incidents.reportIncident.useMutation();
  const handleLocationSelect = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setLocation(coords);
  };
  const onSubmit: SubmitHandler<NewIncidentReport> = async (data) => {
    if (!data || !location) {
      toast.error("Missing required data: location or images");
      return;
    }

    const incidentData: NewIncidentReport = {
      reportTitle: data.reportTitle,
      reportDescription: data.reportDescription,
      incidentDescription: data.incidentDescription,
      categoryType: data.categoryType,
      treatmentType: data.treatmentType,
      status: "INITIATED",
      treatmentDescription: data.treatmentDescription,
      injuredBodyPart: data.injuredBodyPart,
      injuredPersonName: data.injuredPersonName,
      injuredPhoneNumber: data.injuredPhoneNumber,
      injuredPersonEmail: data.injuredPersonEmail,
      firstAiderName: data.firstAiderName,
      firstAiderPhone: data.firstAiderPhone,
      firstAiderEmail: data.firstAiderEmail,
      firstAidDate: data.firstAidDate,
      severity: data.severity,
      followUp: data.followUp,
      mainType: "INCIDENT",
      coordinates:
        location?.latitude && location?.longitude
          ? `${location.latitude},${location.longitude}`
          : "",
      media: images.map((image) => image.id).filter(Boolean),
      managerSignatureConfirmationDate: null, // or a valid date if available
      dynamicQuestion: [], // or appropriate value if available
    };

    try {
      await reportIncident.mutateAsync(incidentData, {
        onSuccess: () => {
          toast.success("Incident reported successfully!");
          router.push("/dashboard/incidents");
          // reset({
          //   incidentTitle: "",
          //   generalHazardDescription: "",
          //   incidentDescription: "",
          //   incidentReportDescription: "",
          // });
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

  // watch fields to control conditional sections
  const treatmentTypeValue = watch("treatmentType");

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
                  rules={{ required: "Incident title is required" }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      label="Incident Title"
                      placeholder="Enter incident title"
                      required
                      error={errors.reportTitle?.message}
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="min-w-[220px] flex-1">
                <Controller
                  name="categoryType"
                  control={control}
                  rules={{ required: "Incident type is required" }}
                  render={({ field }) => (
                    <Select
                      label="Incident Type"
                      required
                      options={Object.keys(IncidentCategoryType)?.map(
                        (t: string) => ({ label: t, value: t }),
                      )}
                      error={errors.categoryType?.message}
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
                      placeholder="Describe the incident (general)"
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
                  Detailed Incident Description
                </label>
                <Controller
                  name="incidentDescription"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className="w-full rounded-md border bg-gray-50 p-3 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:bg-gray-700 dark:text-white dark:autofill:text-white"
                      placeholder="Detailed incident description"
                      rows={4}
                    />
                  )}
                />
                {errors.incidentDescription && (
                  <p className="text-sm text-red-500">
                    {errors.incidentDescription.message}
                  </p>
                )}
              </div>
            </div>

            {/* Medical / injury fields */}
            <div className="flex flex-wrap gap-4">
              {/* <div className="min-w-[220px] flex-1">
                <DateField name="incidentDate" required />
              </div> */}
              <div className="min-w-[220px] flex-1">
                <Controller
                  name="treatmentType"
                  control={control}
                  rules={{ required: "Treatment type is required" }}
                  render={({ field }) => (
                    <Select
                      label="Treatment Type"
                      required
                      options={
                        Object.values(treatmentType).map((t) => ({
                          label: t.replaceAll("_", " "),
                          value: t,
                        })) ?? []
                      }
                      {...field}
                    />
                  )}
                />
                {errors.treatmentType && (
                  <p className="text-sm text-red-500">
                    {errors.treatmentType.message}
                  </p>
                )}
              </div>

              <div className="min-w-[220px] flex-1">
                <Controller
                  name="injuredBodyPart"
                  control={control}
                  rules={{ required: "Injured body part is required" }}
                  render={({ field }) => (
                    <Input
                      label="Injured Body Part"
                      placeholder="e.g., arm"
                      required
                      {...field}
                    />
                  )}
                />
                {errors.injuredBodyPart && (
                  <p className="text-sm text-red-500">
                    {errors.injuredBodyPart.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact fields */}
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[220px] flex-1">
                <Controller
                  name="injuredPersonName"
                  control={control}
                  rules={{ required: "Injured person name is required" }}
                  render={({ field }) => (
                    <Input label="Injured Person Name" {...field} required />
                  )}
                />
                {errors.injuredPersonName && (
                  <p className="text-sm text-red-500">
                    {errors.injuredPersonName.message}
                  </p>
                )}
              </div>
              <div className="min-w-[220px] flex-1">
                <Controller
                  name="injuredPhoneNumber"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]*$/,
                      message: "Only numbers allowed",
                    },
                    required: "Injured person phone number is required",
                  }}
                  render={({ field }) => (
                    <Input label="Injured Person Phone" {...field} required />
                  )}
                />
                {errors.injuredPhoneNumber && (
                  <p className="text-sm text-red-500">
                    {errors.injuredPhoneNumber.message}
                  </p>
                )}
              </div>

              <div className="min-w-[220px] flex-1">
                <Controller
                  name="injuredPersonEmail"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email",
                    },
                    required: "Injured person email is required",
                  }}
                  render={({ field }) => (
                    <Input label="Injured Person Email" {...field} required />
                  )}
                />
                {errors.injuredPersonEmail && (
                  <p className="text-sm text-red-500">
                    {errors.injuredPersonEmail.message}
                  </p>
                )}
              </div>
            </div>

            {/* Conditional: First aider fields when treatmentType === FIRST_AID */}
            {treatmentTypeValue === treatmentType.FIRST_AID && (
              <div className="flex flex-wrap gap-4">
                <div className="min-w-[220px] flex-1">
                  <Controller
                    name="firstAiderName"
                    control={control}
                    rules={{ required: "First aider name is required" }}
                    render={({ field }) => (
                      <Input label="First Aider Name" {...field} required />
                    )}
                  />
                  {errors.firstAiderName && (
                    <p className="text-sm text-red-500">
                      {errors.firstAiderName.message}
                    </p>
                  )}
                </div>
                <div className="min-w-[220px] flex-1">
                  <Controller
                    name="firstAiderPhone"
                    control={control}
                    rules={{
                      pattern: {
                        value: /^[0-9]*$/,
                        message: "Only numbers allowed",
                      },
                      required: "First aider phone number is required",
                    }}
                    render={({ field }) => (
                      <Input label="First Aider Phone" {...field} required />
                    )}
                  />
                  {errors.firstAiderPhone && (
                    <p className="text-sm text-red-500">
                      {errors.firstAiderPhone.message}
                    </p>
                  )}
                </div>
                <div className="min-w-[220px] flex-1">
                  <Controller
                    name="firstAiderEmail"
                    control={control}
                    rules={{
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email",
                      },
                      required: "First aider email is required",
                    }}
                    render={({ field }) => (
                      <Input label="First Aider Email" {...field} required />
                    )}
                  />
                  {errors.firstAiderEmail && (
                    <p className="text-sm text-red-500">
                      {errors.firstAiderEmail.message}
                    </p>
                  )}
                </div>

                {/* <div className="min-w-[220px] flex-1">
                  <Controller
                    name="firstAidDate"
                    control={control}
                    render={({ field }) => (
                      <DatePickerField
                        label="First Aid Date"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div> */}
              </div>
            )}

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
                          className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-50 p-4 text-center font-medium shadow-md transition-all duration-150 dark:bg-gray-700 ${isSelected ? "border" : ""}`}
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
            <div className="min-w-[220px] flex-1">
              <div
                className="flex cursor-pointer items-center gap-2"
                onClick={() => {
                  setValue("followUp", !watch("followUp"));
                }}
              >
                <Controller
                  name="followUp"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                  )}
                />
                <span className="text-sm dark:text-white">
                  Follow up required
                </span>
              </div>
            </div>

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
                disabled={reportIncident.isPending}
                loading={reportIncident.isPending}
              />
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default HazardForm;
