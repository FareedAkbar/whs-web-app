"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { hasPermission } from "@/lib/auth";
import { IconAlertCircle, IconClipboardList } from "@tabler/icons-react";
import AdminDashboard from "../_components/AdminDashboard";
import OtherCounters from "../_components/OtherCounters";
import DashboardCounters from "../_components/DashboardCounters";

const Dashboard = () => {
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;

  // const adminMutation = api.dashboard.getAdminCounters.useQuery();
  // const managerMutation = api.dashboard.getManagerCounters.useMutation();
  // const staffMutation = api.dashboard.getStaffCounters.useMutation();

  // const [roleData, setRoleData] = useState<
  //   AdminDashboardStats | EmpStats | ManagerStats
  // >();
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchRoleData = async () => {
  //     if (!user?.role) return;

  //     try {
  //       if (user.role === "ADMIN") {
  //         const data = await adminMutation.mutateAsync();
  //         setRoleData(data?.data);
  //       } else if (user.role.includes("MANAGER")) {
  //         const data = await managerMutation.mutateAsync();
  //         setRoleData(data?.data);
  //       } else if (user.role === "STAFF") {
  //         const data = await staffMutation.mutateAsync();
  //         setRoleData(data?.data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching dashboard data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   void fetchRoleData();
  // }, [user?.role]);

  // if (loading) {
  //   return (
  //     <div className="relative flex h-2/3 w-full items-center justify-center">
  //       <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col justify-between p-6">
      {/* Dashboard cards */}
      {/* <div>
        {user?.role === "ADMIN" &&
          hasPermission(user.role, "view:homeCards") &&
          roleData && <AdminDashboard data={roleData as AdminDashboardStats} />}

        {user &&
          user?.role !== "ADMIN" &&
          hasPermission(user.role, "view:homeCounters") &&
          roleData && <OtherCounters data={roleData as EmpStats} />}
      </div> */}
      <DashboardCounters />

      {/* Bottom buttons aligned at the end */}
      <div className="flex w-full justify-between gap-4 p-6">
        {/* {user && hasPermission(user.role, "fill:checklist") && (
          <Button
            title="WHS Inspection Checklist"
            onClick={() => router.push("/dashboard/hazard-form")}
            icon={<IconClipboardList size={18} />}
            variant="secondary"
          />
        )} */}
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between">
          {user && hasPermission(user.role, "create:incidents") && (
            <Button
              title="Report an Incident"
              onClick={() => router.push("/dashboard/incident-form")}
              icon={<IconAlertCircle size={18} />}
              className="w-full sm:w-auto"
            />
          )}
          {user && hasPermission(user.role, "create:hazards") && (
            <Button
              title="Report a Hazard"
              onClick={() => router.push("/dashboard/hazard-form")}
              icon={<IconAlertCircle size={18} />}
              className="w-full sm:w-auto"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
