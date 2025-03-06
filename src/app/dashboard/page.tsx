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
  IconUser,
} from "@tabler/icons-react";

import { useRouter } from "next/navigation"; // or "next/router" for older versions
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const Dashboard = () => {
  const router = useRouter();
  const { data: counters, isLoading } = api.dashboard.getCounters.useQuery();
  const session = useSession();
  useEffect(() => {
    void session.update();
  }, []);
  const dashboardItems = [
    {
      title: "Users List",
      icon: <IconUsers size={32} />,
      value: counters?.data?.allUsers,
      onClick: () =>
        router.push(
          session.status === "authenticated"
            ? "/dashboard/users"
            : "/auth/login",
        ),
    },
    {
      title: "Employee List",
      icon: <IconUser size={32} />, // Single user icon for employees
      value: counters?.data?.allEmployees,
      onClick: () =>
        router.push(
          session.status === "authenticated"
            ? "/dashboard/employees"
            : "/auth/login",
        ),
    },
    {
      title: "Contractors List",
      icon: <IconBriefcase size={32} />,
      value: counters?.data?.allWorkers,
      onClick: () =>
        router.push(
          session.status === "authenticated"
            ? "/dashboard/contractors"
            : "/auth/login",
        ),
    },
    {
      title: "Incidents",
      icon: <IconAlertCircle size={32} />,
      value: counters?.data?.allIncidents,
      onClick: () =>
        router.push(
          session.status === "authenticated"
            ? "/dashboard/incidents"
            : "/auth/login",
        ),
    },
    {
      title: "Completed Tasks",
      icon: <IconCheck size={32} />,
      value: counters?.data?.allCompletedIncidents,
      onClick: () =>
        router.push(
          session.status === "authenticated"
            ? "/dashboard/incidents"
            : "/auth/login",
        ),
    },
    {
      title: "Assignable Tasks",
      icon: <IconClipboardList size={32} />,
      value: counters?.data?.allUnassignedIncidents,
      onClick: () =>
        router.push(
          session.status === "authenticated"
            ? "/dashboard/incidents"
            : "/auth/login",
        ),
    },
    {
      title: "Cancelled Tasks",
      icon: <IconClipboardX size={32} />,
      value: counters?.data?.allCancelledIncidents,
      onClick: () =>
        router.push(
          session.status === "authenticated"
            ? "/dashboard/incidents"
            : "/auth/login",
        ),
    },
  ];
  if (isLoading) {
    return (
      <div className="relative flex h-[90vh] w-[80vw] items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }
  return (
    <div className="mt-16 grid h-fit w-full grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
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
