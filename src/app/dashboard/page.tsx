"use client";

import { api } from "@/trpc/react";
import AdminDashboardCard from "../_components/adminDashboardCard";

import {
  IconUsers,
  IconBriefcase,
  IconAlertCircle,
  IconCheck,
  IconClipboardList,
  IconClipboardX,
  IconUser,
  IconAlertCircleFilled,
} from "@tabler/icons-react";

import { useRouter } from "next/navigation"; // or "next/router" for older versions
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { hasPermission } from "@/lib/auth";
import { CirclePlus, HelpCircle, Settings2 } from "lucide-react";
import WorkerDashboardCard from "../_components/workerDashboardCard";

const Dashboard = () => {
  const router = useRouter();
  const { data: counters, isLoading } = api.dashboard.getCounters.useQuery();
  const { data: workerCounters } = api.dashboard.getWorkerCounters.useQuery();
  const session = useSession();
  const user = JSON.parse(localStorage.getItem("user") as string);
  useEffect(() => {
    void session.update();
  }, []);
  console.log("user", user);

  const adminDashboardItems = [
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
  const workerDashboardItems = [
    {
      icon: <CirclePlus size={20} />,
      label: "Reports",
      count: workerCounters?.data?.completedReports ?? 0,
      totalCount:
        user.role === "WORKER"
          ? workerCounters?.data?.reportsAssigned
          : workerCounters?.data?.reportsReported,
      action: () => {},
      isActive: true,
    },
    {
      icon: <Settings2 size={20} />,
      label: "Inspections",
      count: 0,
      totalCount: 0,
      action: () => {},
      isActive: true,
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Tasks",
      count: 0,
      totalCount: 0,
      action: () => {},
      isActive: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-between p-6">
      {/* Dashboard cards */}
      <div className="grid h-fit flex-grow grid-cols-1 gap-6 py-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {user &&
          hasPermission(user, "view:homeCards") &&
          adminDashboardItems.map((item, index) => (
            <AdminDashboardCard
              key={index}
              icon={item.icon}
              title={item.title}
              onClick={item.onClick}
              value={item.value}
            />
          ))}
        {/* If you want to show default dashboard items, uncomment below */}
        {user &&
          hasPermission(user, "view:homeCounters") &&
          workerDashboardItems.map((item, index) => (
            <WorkerDashboardCard
              key={index}
              title={item.label}
              onClick={item.action}
              percentage={
                item.totalCount
                  ? Math.round((item?.count / item.totalCount) * 100)
                  : 0
              }
            />
          ))}
        {/* {dashboardItems.map((item, index) => (
      <AdminDashboardCard
        key={index}
        icon={item.icon}
        title={item.title}
        onClick={item.onClick}
        value={item.value}
      />
    ))} */}
      </div>

      {/* Bottom buttons aligned at the end */}
      <div className="flex w-full justify-between gap-4 pt-6">
        <Button
          title="WHS Inspection Checklist"
          onClick={() => router.push("/dashboard/hazard-form")}
          icon={<IconClipboardList size={18} />}
          variant="secondary"
        />
        <Button
          title="Report an Incident"
          onClick={() => router.push("/dashboard/hazard-form")}
          icon={<IconAlertCircle size={18} />}
        />
      </div>
    </div>
  );
};

export default Dashboard;
