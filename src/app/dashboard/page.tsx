"use client";

import { api } from "@/trpc/react";
import DashboardCard from "../_components/dashboardCard";

import {
  IconUsers,
  IconBriefcase,
  IconAlertCircle,
  IconCheck,
  IconClipboardList,
  IconClipboardX,
} from "@tabler/icons-react";
const { data: counters, isLoading } = api.dashboard.getCounters.useQuery();

import { useRouter } from "next/navigation"; // or "next/router" for older versions

const router = useRouter();

const dashboardItems = [
  {
    title: "Employee List",
    icon: <IconUsers size={32} />,
    value: counters?.data?.allEmployees,
    onClick: () => router.push("/employees"),
  },
  {
    title: "Workers List",
    icon: <IconBriefcase size={32} />,
    value: counters?.data?.allWorkers,
    onClick: () => router.push("/workers"),
  },
  {
    title: "Incidents",
    icon: <IconAlertCircle size={32} />,
    value: counters?.data?.allIncidents,
    onClick: () => router.push("/incidents"),
  },
  {
    title: "Completed Tasks",
    icon: <IconCheck size={32} />,
    value: counters?.data?.allCompletedIncidents,
    onClick: () => router.push("/tasks/completed"),
  },
  {
    title: "Assignable Tasks",
    icon: <IconClipboardList size={32} />,
    value: counters?.data?.allUnassignedIncidents,
    onClick: () => router.push("/tasks/assignable"),
  },
  {
    title: "Cancelled Tasks",
    icon: <IconClipboardX size={32} />,
    value: counters?.data?.allCancelledIncidents,
    onClick: () => router.push("/tasks/cancelled"),
  },
];

const Dashboard = () => {
  if (isLoading) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }
  return (
    <div className="ml-20 mt-16 grid h-fit grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
      {dashboardItems.map((item, index) => (
        <DashboardCard
          key={index}
          icon={item.icon}
          title={item.title}
          onClick={item.onClick}
          value={item.value}
        />
      ))}
    </div>
  );
};

export default Dashboard;
