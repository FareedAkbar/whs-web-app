"use client";

import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import {
  IconFirstAidKit,
  IconAlertTriangle,
  IconChecklist,
} from "@tabler/icons-react";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const COLORS = ["#EC1C29", "#10b981", "#f59e0b", "#3b82f6"];

const options = {
  plugins: { legend: { display: false } },
};

const DashboardCounters: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, isError } =
    api.dashboard.getDashboardCounters.useQuery();

  if (isLoading) {
    return (
      <div className="relative flex h-[70vh] w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-gray-500 dark:text-gray-300">
          Failed to load dashboard data.
        </p>
      </div>
    );
  }

  const dashboard = data.data;

  const hasIncidents =
    dashboard.incidents && Object.keys(dashboard.incidents).length > 0;
  const hasHazards =
    dashboard.hazards && Object.keys(dashboard.hazards).length > 0;

  return (
    <div className="flex flex-wrap gap-6 p-6">
      {/* Dynamically render available cards in equal space */}
      {[
        dashboard.users && Object.keys(dashboard.users).length > 0 && (
          <UsersCard
            key="users"
            users={dashboard.users}
            onClick={() => router.push("/dashboard/users")}
          />
        ),
        hasIncidents && (
          <StatCard
            key="incidents"
            title="Incidents"
            icon={<IconFirstAidKit size={20} className="text-primary" />}
            data={dashboard.incidents}
            onClick={() => router.push("/dashboard/incidents")}
          />
        ),
        hasHazards && (
          <StatCard
            key="hazards"
            title="Hazards"
            icon={<IconAlertTriangle size={20} className="text-primary" />}
            data={dashboard.hazards}
            onClick={() => router.push("/dashboard/hazards")}
          />
        ),
        dashboard.inspections &&
          Object.keys(dashboard.inspections).length > 0 && (
            <Card
              key="inspections"
              onClick={() => router.push("/dashboard/inspections")}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold dark:text-white">
                  Inspections
                </h3>
                <IconChecklist size={20} className="text-primary" />
              </div>
              {Object.entries(dashboard.inspections).map(([key, value]) => (
                <div key={key} className="mb-2 flex justify-between">
                  <p className="text-sm capitalize dark:text-gray-200">{key}</p>
                  <p className="text-sm font-bold dark:text-white">{value}</p>
                </div>
              ))}
            </Card>
          ),
      ]
        .filter(Boolean)
        .map((card, index, arr) => (
          <div key={index} className={`min-w-[280px] flex-1`}>
            {card}
          </div>
        ))}
    </div>
  );
};

export default DashboardCounters;

/* ---------------- Reusable Components ---------------- */

function Card({
  children,
  onClick,
  className = "",
}: React.PropsWithChildren<{ onClick?: () => void; className?: string }>) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-lg transition-transform duration-200 hover:scale-[1.01] dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      {children}
    </div>
  );
}

/* --- UsersCard --- */
const UsersCard = ({
  users,
  onClick,
}: {
  users: Record<string, number>;
  onClick: () => void;
}) => {
  const userKeys = Object.keys(users).filter((k) => k !== "Total");
  if (userKeys.length === 0) return null;

  const userChartData = {
    labels: userKeys,
    datasets: [
      {
        data: userKeys.map((key) => users[key]),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card onClick={onClick}>
      <div className="flex flex-col items-center">
        <div className="mb-6 h-36 w-36">
          <Pie data={userChartData} options={options} />
        </div>
        <h3 className="mb-4 text-lg font-semibold dark:text-white">Users</h3>
        {userKeys.map((key, index) => (
          <div key={key} className="mb-2 flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <p className="text-sm dark:text-gray-200">
              {key}: <span className="font-bold">{users[key]}</span>
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* --- StatCard --- */
interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  data: { Total: number; [key: string]: number };
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, icon, data, onClick }) => {
  const total = data.Total ?? 0;
  const keys = Object.keys(data).filter((k) => k !== "Total");

  if (keys.length === 0) return null;

  return (
    <Card onClick={onClick}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
        {icon}
      </div>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
        Total: <span className="font-bold">{total}</span>
      </p>

      {keys.map((key) => {
        const count = Number(data[key]);
        const percentage = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key} className="mb-3">
            <div className="flex justify-between">
              <p className="text-sm capitalize dark:text-gray-200">{key}</p>
              <p className="text-sm font-semibold dark:text-white">{count}</p>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${percentage || 0}%`,
                  background: "linear-gradient(to right, #FF646E, #D4010E)",
                }}
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
};
