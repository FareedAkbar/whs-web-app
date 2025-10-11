import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFormContext } from "react-hook-form";

interface DateFieldProps {
  label?: string;
  name: string;
  required?: boolean;
}

const DateField: React.FC<DateFieldProps> = ({
  label = "Date of Incident",
  name,
  required = false,
}) => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const date = watch(name);

  return (
    <div className="flex w-full flex-col">
      {label && (
        <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <DatePicker
        selected={date ? new Date(date) : null}
        onChange={(selectedDate) => {
          setValue(name, selectedDate, { shouldValidate: true });
        }}
        dateFormat="dd/MM/yyyy"
        placeholderText="Select date"
        className="shadow-input flex h-10 w-full cursor-pointer appearance-none rounded-md border bg-gray-50 px-3 py-2 pr-10 text-sm text-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:bg-gray-700 dark:text-white"
        calendarClassName="z-50"
        maxDate={new Date()} // Optional: restrict to today or earlier
        showPopperArrow={false}
      />

      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">
          {(errors[name]?.message as string) || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default DateField;
