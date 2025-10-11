"use client";

import { useContext, useMemo, useState } from "react";
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
import {
  IncidentCategoryType,
  NewIncidentReport,
  treatmentType,
} from "@/types/report";
import DateField from "@/components/ui/DateField";

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
  const { control, handleSubmit, register, setValue, watch, formState } =
    methods;
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
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme;
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  // const uploadMedia = api.media.uploadMedia.useMutation();
  const router = useRouter();
  const reportIncident = api.incidents.reportIncident.useMutation();
  const { data: enums } = api.enums.getEnums.useQuery();
  const session = useSession();
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
        location && location.latitude && location.longitude
          ? `${location.latitude},${location.longitude}`
          : "",
      media: images.map((image) => image.id).filter(Boolean),
      managerSignatureConfirmationDate: null, // or a valid date if available
      dynamicQuestion: [], // or appropriate value if available
    };

    console.log("Incident Data:", incidentData);
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
                  Report Description
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
                    <Input label="Injured Person Name" {...field} />
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
                    <Input label="Injured Person Phone" {...field} />
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
                    <Input label="Injured Person Email" {...field} />
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
            {treatmentTypeValue === "FIRST_AID" && (
              <div className="flex flex-wrap gap-4">
                <div className="min-w-[220px] flex-1">
                  <Controller
                    name="firstAiderName"
                    control={control}
                    rules={{ required: "First aider name is required" }}
                    render={({ field }) => (
                      <Input label="First Aider Name" {...field} />
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
                      <Input label="First Aider Phone" {...field} />
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
                      <Input label="First Aider Email" {...field} />
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
                    Severity
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
                            setSelectedSeverity(key);
                          }}
                          className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg p-4 text-center font-medium shadow-sm transition-all duration-150 ${
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
                  <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Images
                  </label>

                  <div className="mt-2 flex items-center gap-3">
                    {/* Upload Button */}
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-300 bg-white shadow dark:bg-gray-700">
                      <IconUpload size={32} />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          handleFileChange(e);
                          // update field value for validation sync
                          const files = Array.from(e.target.files ?? []);
                          if (files.length > 0) {
                            const newImages = files.map((file, i) => ({
                              id: `${file.name}-${i}`,
                              url: URL.createObjectURL(file),
                            }));
                            field.onChange([...images, ...newImages]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Preview Thumbnails */}
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="relative h-24 w-24 rounded-2xl bg-gray-100 shadow-lg"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = images.filter(
                              (i) => i.id !== img.id,
                            );
                            setImages(filtered);
                            field.onChange(filtered); // keep RHF synced
                          }}
                          className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-red-500 hover:bg-red-50"
                        >
                          <IconX size={16} />
                        </button>

                        {img.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img.url}
                            alt={img.id}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-700 dark:text-gray-300">
                            {img.id}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {errors.media && (
                    <p className="mt-1 text-sm text-red-500">
                      {String(errors.media.message)}
                    </p>
                  )}
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
