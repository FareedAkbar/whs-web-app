"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import {
  IconAlertTriangle,
  IconBuilding,
  IconChecklist,
  IconFirstAidKit,
} from "@tabler/icons-react";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const options = {
  plugins: {
    legend: { display: false }, // hide default legend
  },
};

// ---- Types ----
type StatMap = { Total: number } & Record<string, number>;
interface AdminDashboard {
  users: StatMap;
  incidents: StatMap;
  hazards: StatMap;
  groups: Record<string, number>;
  inspections: Record<string, number>;
}

interface DashboardProps {
  data: AdminDashboard;
}

const COLORS = ["#EC1C29", "#10b981", "#f59e0b", "#3B82F6"];

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const router = useRouter();
  const userKeys = Object.keys(data.users).filter((k) => k !== "Total");

  const userChartData = {
    labels: userKeys,
    datasets: [
      {
        data: userKeys.map(
          (key) => data.users[key as keyof typeof data.users] as number,
        ),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-3">
      {/* COL 1: USERS */}
      <Card
        onClick={() => router.push("/dashboard/users")}
        className="flex flex-col items-center"
      >
        <div className="mb-6 flex w-full justify-center">
          <div className="h-36 w-36">
            <Pie data={userChartData} options={options} />
          </div>
        </div>

        <div className="w-full">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">Users</h3>
          {userKeys.map((key, index) => (
            <div key={key} className="mb-2 flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <p className="text-sm dark:text-gray-200">
                {key}:{" "}
                <span className="font-bold">
                  {String(data.users[key as keyof typeof data.users])}
                </span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* COL 2-3: STACK OF UNITS + INSPECTIONS */}
      <div className="flex flex-col gap-6 xl:col-span-2">
        <Card onClick={() => router.push("/dashboard/group")}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">
              Reporting Units
            </h3>
            <IconBuilding size={20} className="text-primary" />
          </div>
          {Object.entries(data.groups).map(([key, value]) => (
            <div key={key} className="mb-2 flex justify-between">
              <p className="text-sm capitalize dark:text-gray-200">{key}</p>
              <p className="text-sm font-bold dark:text-white">{value}</p>
            </div>
          ))}
        </Card>

        <Card onClick={() => router.push("/dashboard/inspections-checklist")}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">
              Inspections
            </h3>
            <IconChecklist size={20} className="text-primary" />
          </div>
          {Object.entries(data.inspections).map(([key, value]) => (
            <div key={key} className="mb-2 flex justify-between">
              <p className="text-sm capitalize dark:text-gray-200">{key}</p>
              <p className="text-sm font-bold dark:text-white">{value}</p>
            </div>
          ))}
        </Card>
      </div>

      {/* NEXT ROW: INCIDENTS + HAZARDS */}
      <div className="grid grid-cols-1 gap-6 xl:col-span-3 xl:grid-cols-2">
        <StatCard
          title="Incidents"
          icon={<IconFirstAidKit size={20} className="text-primary" />}
          data={data.incidents}
          onClick={() => router.push("/dashboard/incidents")}
        />

        <StatCard
          title="Hazards"
          icon={<IconAlertTriangle size={20} className="text-primary" />}
          data={data.hazards}
          onClick={() => router.push("/dashboard/hazards")}
        />
      </div>
    </div>
  );
};

export default Dashboard;

// ---- Reusable Components ----
function Card({
  children,
  onClick,
  className = "",
}: React.PropsWithChildren<{ onClick?: () => void; className?: string }>) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer flex-col rounded-2xl border border-[#ECE6E6] bg-white p-6 shadow-lg transition-transform duration-200 hover:scale-[1.01] dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  data: { Total: number; [key: string]: number };
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, icon, data, onClick }) => {
  const total = data.Total ?? 0;
  const keys = Object.keys(data).filter((k) => k !== "Total");

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
