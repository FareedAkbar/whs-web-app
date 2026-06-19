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
import {
  severityMapping,
  severityDisplayMapping,
  severityDescriptionMapping,
} from "@/constants/severity";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/Select";
import {
  CreateIncidentPayload,
  IncidentCategoryType,
  NewHazardReport,
  NewIncidentReport,
  treatmentType,
} from "@/types/report";
import MediaPicker from "@/components/media/MediaPicker";
import type { SelectedMedia } from "@/types/media";
import { SeveritySelector } from "@/components/ui/SeveritySelector";

// const Map = dynamic(() => import("@/components/Map"), { ssr: false });
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
      hazardId: "",
      hazardLinkMode: "existing",
      hazardReportTitle: "",
      hazardReportDescription: "",
      hazardSeverity: undefined,
      hazardCoordinates: "",
      hazardCategoryType: "",
      hazardDescription: "",
    },
  });
  const { control, handleSubmit, setValue, watch, formState } = methods;
  const severityKeys = useMemo(() => Object.keys(severityMapping), []);
  const { errors } = formState;

  // Commented out Leaflet Map state
  // const [location, setLocation] = useState<{
  //   latitude: number;
  //   longitude: number;
  // } | null>({
  //   latitude: -34.405,
  //   longitude: 150.644,
  // });

  const [images, setImages] = useState<SelectedMedia[]>([]);
  const [hazardImages, setHazardImages] = useState<SelectedMedia[]>([]);
  const router = useRouter();
  const reportIncident = api.incidents.reportIncident.useMutation();

  // Fetch existing hazards to support linking
  const { data: hazardsRes } = api.incidents.getHazards.useQuery();
  const hazardsList = hazardsRes?.data ?? [];
  const linkToHazard = watch("linkToHazard");
  const hazardLinkMode = watch("hazardLinkMode") ?? "existing";
  const selectedHazardId = watch("hazardId");

  // Commented out location select handler
  // const handleLocationSelect = (coords: {
  //   latitude: number;
  //   longitude: number;
  // }) => {
  //   setLocation(coords);
  // };

  const onSubmit: SubmitHandler<NewIncidentReport> = async (data) => {
    if (!data) {
      toast.error("Missing required data");
      return;
    }

    const incidentData: CreateIncidentPayload["incident"] = {
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
      mainType: "INCIDENT",
      address: data.address,
      media: images.map((image) => image.id).filter(Boolean),
      managerSignatureConfirmationDate: null,
    };

    const payload: CreateIncidentPayload = {
      incident: incidentData,
    };

    if (data.linkToHazard && data.hazardLinkMode === "existing") {
      if (!data.hazardId) {
        toast.error("Please select a hazard to link");
        return;
      }
      payload.hazardId = data.hazardId;
    }

    if (data.linkToHazard && data.hazardLinkMode === "new") {
      if (
        !data.hazardReportTitle ||
        !data.hazardDescription ||
        !data.hazardSeverity ||
        !data.hazardAddress
      ) {
        toast.error("Please fill the required hazard fields");
        return;
      }

      const newHazardData: NewHazardReport = {
        reportTitle: data.hazardReportTitle,
        reportDescription: data.hazardReportDescription ?? "",
        hazardDescription: data.hazardDescription,
        status: "INITIATED",
        severity: data.hazardSeverity,
        mainType: "HAZARD",
        address: data.hazardAddress,
        media: hazardImages.map((image) => image.id).filter(Boolean),
        managerSignatureConfirmationDate: null,
        categoryType: data.hazardCategoryType || String(data.categoryType),
      };

      payload.hazard = newHazardData;
    }

    try {
      await reportIncident.mutateAsync(payload, {
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
      {/* People and Culture Notice Banner */}
      <div className="mb-6 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950">
        <div className="flex">
          <div className="flex-shrink-0">
            <IconCircleCheckFilled
              className="h-5 w-5 text-blue-400 dark:text-blue-500"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-200">
              <strong>Note:</strong> All incidents reported will be forwarded to
              People and Culture.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:shadow-gray-700">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* first row: title and incident type */}
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

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                <Controller
                  name="linkToHazard"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={!!field.value}
                      onChange={(event) => {
                        field.onChange(event.target.checked);
                        if (!event.target.checked) {
                          setValue("hazardId", "");
                        }
                      }}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                  )}
                />
                Link to hazard
              </label>

              {linkToHazard && (
                <div className="mt-4 space-y-4">
                  <Controller
                    name="hazardLinkMode"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-4">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <input
                            type="radio"
                            value="existing"
                            checked={field.value === "existing"}
                            onChange={() => {
                              field.onChange("existing");
                            }}
                            className="accent-primary"
                          />
                          Existing hazard
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <input
                            type="radio"
                            value="new"
                            checked={field.value === "new"}
                            onChange={() => {
                              field.onChange("new");
                              setValue("hazardId", "");
                            }}
                            className="accent-primary"
                          />
                          New hazard
                        </label>
                      </div>
                    )}
                  />

                  {hazardLinkMode === "existing" && (
                    <Controller
                      name="hazardId"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                            Select Hazard
                          </p>
                          <div className="grid gap-3 md:grid-cols-2">
                            {hazardsList.map((item) => {
                              const hazardId = item.hazard?.id ?? "";
                              const ticketNumber =
                                item.report.ticket_number ??
                                item.report.ticketNumber ??
                                `HZ-${item.report.id.substring(0, 8).toUpperCase()}`;
                              const isSelected = field.value === hazardId;

                              return (
                                <button
                                  type="button"
                                  key={item.report.id}
                                  disabled={!hazardId}
                                  onClick={() => {
                                    field.onChange(hazardId);
                                  }}
                                  className={`rounded-lg border p-4 text-left transition ${
                                    isSelected
                                      ? "border-primary bg-white shadow-md dark:bg-gray-800"
                                      : "border-gray-200 bg-white hover:border-primary/60 dark:border-gray-700 dark:bg-gray-800"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-xs font-semibold uppercase text-primary">
                                        {ticketNumber}
                                      </p>
                                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        {item.report.title}
                                      </p>
                                    </div>
                                    <span
                                      className={`mt-1 h-4 w-4 rounded-full border ${
                                        isSelected
                                          ? "border-primary bg-primary"
                                          : "border-gray-300"
                                      }`}
                                    />
                                  </div>
                                  <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                                    {item.hazard?.hazardDescription ||
                                      item.report.description ||
                                      "No description provided"}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                          {hazardsList.length === 0 && (
                            <p className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-300">
                              No hazards available.
                            </p>
                          )}
                          {linkToHazard && !selectedHazardId && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                              Choose one hazard before submitting.
                            </p>
                          )}
                        </div>
                      )}
                    />
                  )}

                  {hazardLinkMode === "new" && (
                    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Controller
                          name="hazardReportTitle"
                          control={control}
                          rules={
                            linkToHazard && hazardLinkMode === "new"
                              ? { required: "Hazard title is required" }
                              : undefined
                          }
                          render={({ field }) => (
                            <Input
                              label="Hazard Title"
                              placeholder="Enter hazard title"
                              required
                              error={errors.hazardReportTitle?.message}
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="hazardCategoryType"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Hazard Type"
                              placeholder="e.g. CHEMICAL"
                              {...field}
                            />
                          )}
                        />
                        <Controller
                          name="hazardAddress"
                          control={control}
                          rules={
                            linkToHazard && hazardLinkMode === "new"
                              ? { required: "Hazard location is required" }
                              : undefined
                          }
                          render={({ field }) => (
                            <Input
                              label="Hazard Location"
                              placeholder="E.g. Building 9, Sports Hub"
                              required
                              error={errors.hazardAddress?.message}
                              {...field}
                            />
                          )}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                         <div>
                          <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Detailed Hazard Description{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="hazardDescription"
                            control={control}
                            rules={
                              linkToHazard && hazardLinkMode === "new"
                                ? {
                                    required:
                                      "Detailed hazard description is required",
                                  }
                                : undefined
                            }
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
                          <Controller
                            name="hazardSeverity"
                            control={control}
                            rules={{ required: "Hazard Severity is required" }}
                            render={({ field }) => (
                              <SeveritySelector
                                value={field.value!}
                                label="Hazard Severity"
                                onChange={field.onChange}
                                error={errors?.hazardSeverity?.message as string}
                              />
                            )}
                          />                       
                           {/* <Controller
                          name="hazardSeverity"
                          control={control}
                          rules={
                            linkToHazard && hazardLinkMode === "new"
                              ? { required: "Hazard severity is required" }
                              : undefined
                          }
                          render={({ field }) => (
                            <Select
                              label="Hazard Severity"
                              required
                              options={severityKeys.map((key) => ({
                                label: severityDisplayMapping[key] || key,
                                value: key,
                              }))}
                              error={errors.hazardSeverity?.message}
                              {...field}
                            />
                          )}
                        /> */}
                      </div>

                     

                      <MediaPicker
                        value={hazardImages}
                        onChange={setHazardImages}
                      />
                    </div>
                  )}
                </div>
              )}
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
                      error={errors.treatmentType?.message}
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
             
              </div>
              {treatmentTypeValue === treatmentType.OTHER && (
                <div className="min-w-[220px] flex-1">
                  <Controller
                    name="treatmentDescription"
                    control={control}
                    rules={{ required: "Treatment description is required" }}
                    render={({ field }) => (
                      <Input
                        label="Treatment Description"
                        placeholder="Describe the treatment"
                        required
                        {...field}
                        error={errors.treatmentDescription?.message}
                      />
                    )}
                  />
                  
                </div>
              )}

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
                      error={errors.injuredBodyPart?.message}
                    />
                  )}
                />
               
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
                    <Input label="Injured Person Name" {...field} required error={errors.injuredPersonName?.message}/>
                  )}
                />
                
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
                    <Input label="Injured Person Phone" {...field} required error={errors.injuredPhoneNumber?.message} />
                  )}
                />
                
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
                    <Input label="Injured Person Email" {...field} required error={errors.injuredPersonEmail?.message} />
                  )}
                />
                
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
<div className="flex flex-wrap gap-4">
<div className="min-w-[220px] flex-1">
              <Controller
                name="address"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <Input
                    type="text"
                    label="Location"
                    placeholder="E.g. Building 9, Sports Hub"
                    required
                    error={errors.address?.message}
                    {...field}
                  />
                )}
              />
            </div>   
            <Controller
              name="severity"
              control={control}
              rules={{ required: "Severity is required" }}
              render={({ field }) => (
                <SeveritySelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors?.severity?.message as string}
                />
              )}
            />  
</div>
         
          {/* Commented out Map (location) */}
            {/* <div className="relative z-0 mt-4 h-60 overflow-hidden rounded-md border">
              <Map
                height={240}
                coordinates={location}
                onLocationSelect={handleLocationSelect}
              />
            </div> */}

            {/* Location input field */}
           

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

            {/* Commented out follow-up checkbox */}
            {/* <div className="min-w-[220px] flex-1">
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
            </div> */}

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
                title={
                  linkToHazard && hazardLinkMode === "new"
                    ? "Create Incident and Hazard"
                    : "Create Incident"
                }
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
