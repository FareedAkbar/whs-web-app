"use client";

import { api } from "@/trpc/react";
import AdminDashboardCard from "../_components/adminDashboardCard";
import WorkerDashboardCard from "../_components/workerDashboardCard";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { hasPermission } from "@/lib/auth";
import {
  IconUsers,
  IconBriefcase,
  IconAlertCircle,
  IconCheck,
  IconClipboardList,
  IconClipboardX,
  IconUser,
} from "@tabler/icons-react";
import { CirclePlus, ClipboardList, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;

  const adminMutation = api.dashboard.getAdminCounters.useMutation();
  const workerMutation = api.dashboard.getWorkerCounters.useMutation();
  const employeeMutation = api.dashboard.getEmployeeCounters.useMutation();

  const [roleData, setRoleData] = useState<DashboardStats | WorkerCount | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleData = async () => {
      if (!user?.role) return;

      try {
        if (user.role === "ADMIN") {
          const data = await adminMutation.mutateAsync();
          setRoleData(data?.data ?? null);
        } else if (user.role === "WORKER") {
          const data = await workerMutation.mutateAsync();
          setRoleData(data?.data ?? null);
        } else if (user.role === "STAFF") {
          const data = await employeeMutation.mutateAsync();
          setRoleData(data?.data ?? null);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchRoleData();
  }, [user?.role]);

  const counters = roleData;

  const adminDashboardItems = [
    {
      title: "Users List",
      icon: <IconUsers size={32} />,
      value: counters && "allUsers" in counters ? counters.allUsers : undefined,
      onClick: () => router.push("/dashboard/users"),
    },
    {
      title: "Employee List",
      icon: <IconUser size={32} />,
      value:
        counters && "allEmployees" in counters
          ? counters.allEmployees
          : undefined,
      onClick: () => router.push("/dashboard/employees"),
    },
    {
      title: "Contractors List",
      icon: <IconBriefcase size={32} />,
      value:
        counters && "allWorkers" in counters ? counters.allWorkers : undefined,
      onClick: () => router.push("/dashboard/contractors"),
    },
    {
      title: "Incidents",
      icon: <IconAlertCircle size={32} />,
      value:
        counters && "allIncidents" in counters
          ? counters.allIncidents
          : undefined,
      onClick: () => router.push("/dashboard/incidents"),
    },
    {
      title: "Completed Tasks",
      icon: <IconCheck size={32} />,
      value:
        counters && "allCompletedIncidents" in counters
          ? counters.allCompletedIncidents
          : undefined,
      onClick: () => router.push("/dashboard/incidents"),
    },
    {
      title: "Assignable Tasks",
      icon: <IconClipboardList size={32} />,
      value:
        counters && "allUnassignedIncidents" in counters
          ? counters.allUnassignedIncidents
          : undefined,
      onClick: () => router.push("/dashboard/incidents"),
    },
    {
      title: "Cancelled Tasks",
      icon: <IconClipboardX size={32} />,
      value:
        counters && "allCancelledIncidents" in counters
          ? counters.allCancelledIncidents
          : undefined,
      onClick: () => router.push("/dashboard/incidents"),
    },
  ];

  const workerDashboardItems = [
    {
      icon: <CirclePlus size={20} />,
      label: "Reports",
      count:
        counters && "completedReports" in counters
          ? counters.completedReports
          : 0,
      totalCount:
        counters && "reportsReported" in counters
          ? counters.reportsReported
          : 0,
      action: () => {
        router.push("/dashboard/inspections");
      },
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Assigned Inspections",
      count:
        counters && "reportsAssigned" in counters
          ? counters.reportsAssigned
          : 0,
      totalCount:
        counters && "completedReports" in counters
          ? counters.completedReports
          : 0,
      action: () => {
        router.push("/dashboard/inspections");
      },
    },
    {
      icon: <CheckCircle size={20} />,
      label: "Completed Tasks",
      count:
        counters && "completedReports" in counters
          ? counters.completedReports
          : 0,
      totalCount:
        counters && "reportsAssigned" in counters
          ? counters.reportsAssigned
          : 0,
      action: () => {
        router.push("/dashboard/inspections");
      },
    },
  ];

  if (loading) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between p-6">
      {/* Dashboard cards */}
      <div className="grid h-fit flex-grow grid-cols-1 gap-6 py-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {user?.role === "ADMIN" &&
          hasPermission(user.role, "view:homeCards") &&
          adminDashboardItems.map((item, index) => (
            <AdminDashboardCard
              key={index}
              icon={item.icon}
              title={item.title}
              onClick={item.onClick}
              value={item.value}
            />
          ))}
        {(user?.role === "WORKER" || user?.role === "STAFF") &&
          hasPermission(user.role, "view:homeCounters") &&
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
              total={item.count}
            />
          ))}
      </div>

      {/* Bottom buttons aligned at the end */}
      <div className="flex w-full justify-between gap-4 pt-6">
        {/* {user && hasPermission(user.role, "fill:checklist") && (
          <Button
            title="WHS Inspection Checklist"
            onClick={() => router.push("/dashboard/hazard-form")}
            icon={<IconClipboardList size={18} />}
            variant="secondary"
          />
        )} */}
        {user && hasPermission(user.role, "create:checklist") && (
          <Button
            title="WHS Inspection Checklist"
            onClick={() => router.push("/dashboard/inspections-checklist")}
            icon={<IconClipboardList size={18} />}
            variant="secondary"
          />
        )}
        {user && hasPermission(user.role, "create:incidents") && (
          <Button
            title="Report an Incident"
            onClick={() => router.push("/dashboard/hazard-form")}
            icon={<IconAlertCircle size={18} />}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
