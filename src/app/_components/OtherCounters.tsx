"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  IconAlertTriangle,
  IconAmbulance,
  IconBuildingCommunity,
} from "@tabler/icons-react";

interface StatusCounts {
  total: number;
  [key: string]: number;
}

interface DashboardGroup {
  id: string;
  name: string;
  groupType: string;
  description?: string;
  staff: number;
}

type Props = {
  data: {
    incidents?: StatusCounts;
    hazards?: StatusCounts;
    group?: DashboardGroup;
  };
};

type StatCardProps = {
  title: string;
  icon: React.ReactNode;
  data: StatusCounts;
  navigateTo: () => void;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  icon,
  data,
  navigateTo,
}) => {
  const keys = Object.keys(data).filter((k) => k !== "total");
  const total = data.total;

  return (
    <div
      onClick={navigateTo}
      className="flex-1 cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-lg transition-all duration-300 hover:scale-[1.02] dark:border-gray-600 dark:bg-gray-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </p>
        {icon}
      </div>

      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
        Total: <span className="font-bold">{total}</span>
      </p>

      {keys.map((key, index) => {
        const count = data[key];
        const percentage =
          total !== 0 ? ((count! / total) * 100).toFixed(0) : 0;
        return (
          <div key={key} className="mb-2">
            <div className="flex justify-between">
              <span className="text-sm capitalize text-gray-700 dark:text-gray-200">
                {key}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {count}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percentage}%`,
                  background: "linear-gradient(to right, #FF646E, #D4010E)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OtherCounters: React.FC<Props> = ({ data }) => {
  const router = useRouter();

  return (
    <div className="mt-6 space-y-4">
      <div
        className={`grid grid-cols-1 gap-4 ${!data.group && "md:grid-cols-2"}`}
      >
        {data.incidents && (
          <StatCard
            title="Incidents"
            icon={<IconAmbulance size={22} className="text-primary" />}
            data={data.incidents}
            navigateTo={() => router.push("/dashboard/incidents")}
          />
        )}

        {data.hazards && (
          <StatCard
            title="Hazards"
            icon={<IconAlertTriangle size={22} className="text-primary" />}
            data={data.hazards}
            navigateTo={() => router.push("/dashboard/hazards")}
          />
        )}
      </div>

      {data.group && (
        <div
          onClick={() => router.push(`/group/${data.group?.id}`)}
          className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] dark:border-gray-600 dark:bg-gray-900"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              Reporting Unit
            </p>
            <IconBuildingCommunity size={22} className="text-primary" />
          </div>

          <p className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
            {data.group.name} ({data.group.groupType})
          </p>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">
            Description: {data.group.description}
          </p>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">
            Staff Count: {data.group.staff}
          </p>
        </div>
      )}
    </div>
  );
};

export default OtherCounters;
