import { IconAlertTriangleFilled, IconCircleCheckFilled } from "@tabler/icons-react";
import {
  severityMapping,
  severityDisplayMapping,
  severityDescriptionMapping,
} from "@/constants/severity";

interface SeveritySelectorProps {
  value: string;
  onChange: (key: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export function SeveritySelector({
  value,
  onChange,
  error,
  label = "Severity",
  required = true,
}: SeveritySelectorProps) {
  const severityKeys = Object.keys(severityMapping);

  return (
    <div>
      <label className="block pb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="flex flex-wrap gap-3">
        {severityKeys.map((key) => {
          const color = severityMapping[key];
          const isSelected = value === key;
          const displayName = severityDisplayMapping[key] || key;
          const description = severityDescriptionMapping[key] || "";

          return (
            <div key={key} className="group relative">
              <div
                role="button"
                title={description}
                tabIndex={0}
                onClick={() => onChange(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(key);
                  }
                }}
                className={`relative flex h-24 w-28 cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-50 p-4 text-center font-medium shadow-md transition-all duration-150 dark:bg-gray-700 ${
                  isSelected ? "border" : ""
                }`}
                style={{
                  backgroundColor: isSelected ? `${color}22` : undefined,
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
                <span className="mt-2 block text-xs">{displayName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}