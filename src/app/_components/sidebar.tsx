"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconAlertTriangle,
  IconUsers,
  IconUser,
  IconInfoCircle,
  IconDeviceMobileCog,
  IconLock,
  IconFileText,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
  IconHomeFilled,
  IconUserCircle,
  IconUserFilled,
  IconChecklist,
} from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/auth";
import { cn } from "@/lib/utils"; // optional: Tailwind class helper
import Button from "@/components/ui/Button";
import Image from "next/image";

const Sidebar = ({
  isDrawerOpen = false,
  toggleDrawer,
}: {
  isDrawerOpen?: boolean;
  toggleDrawer?: () => void;
}) => {
  const pathname = usePathname();
  const session = useSession();
  const [isOpen, setIsOpen] = useState(true);

  const user = session.data?.user;
  const navItems = [
    { name: "Home", icon: <IconHomeFilled size={20} />, path: "/dashboard" },
  ];

  if (user) {
    const role = user.role;

    if (
      role === "ADMIN" ||
      role === "P_AND_C_MANAGER" ||
      role === "FACILITY_MANAGER"
    ) {
      navItems.push(
        // {
        //   name: "Contractors",
        //   icon: <IconUsers size={20} />,
        //   path: "/dashboard/contractors",
        // },
        // {
        //   name: "Employees",
        //   icon: <IconTable size={20} />,
        //   path: "/dashboard/employees",
        // },
        {
          name: "Users",
          icon: <IconUser size={20} />,
          path: "/dashboard/users",
        },

        // {
        //   name: "Departments",
        //   icon: <IconTable size={20} />,
        //   path: "/dashboard/departments",
        // },
      );
    }
    if (
      role == "P_AND_C_MANAGER" ||
      role === "P_AND_C_OFFICER" ||
      role === "ADMIN" ||
      role === "STAFF"
    ) {
      navItems.push({
        name: "Incidents",
        icon: <IconAlertTriangle size={20} />,
        path: "/dashboard/incidents",
      });
    }
    if (
      role === "FACILITY_MANAGER" ||
      role === "FACILITY_OFFICER" ||
      role === "ADMIN" ||
      role === "STAFF"
    ) {
      navItems.push({
        name: "Hazards",
        icon: <IconAlertTriangle size={20} />,
        path: "/dashboard/hazards",
      });
    }

    navItems.push(
      {
        name: "Inspections",
        icon: <IconChecklist size={20} />,
        path: "/dashboard/inspections",
      },
      {
        name: "Profile",
        icon: <IconUserCircle size={20} />,
        path: "/dashboard/profile",
      },
      {
        name: "About",
        icon: <IconInfoCircle size={20} />,
        path: "/dashboard/about",
      },
      {
        name: "App Usage",
        icon: <IconDeviceMobileCog size={20} />,
        path: "/dashboard/app-usage",
      },
      {
        name: "Privacy Policy",
        icon: <IconLock size={20} />,
        path: "/dashboard/policy",
      },
      {
        name: "Terms and Conditions",
        icon: <IconFileText size={20} />,
        path: "/dashboard/terms",
      },
    );
  }

  return (
    <>
      {/* Overlay for mobile drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={toggleDrawer}
        />
      )}

      {/* Sidebar */}
      {/* <div
        className={cn(
          "relative z-40 h-full bg-white shadow-md transition-all duration-300",
          isDrawerOpen
            ? "fixed left-0 w-64 p-4 md:static md:block"
            : "sm:hidden",
          isOpen ? "w-64 p-4" : "w-16 p-2",
          
        )}
      > */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white p-4 shadow-md transition-all duration-300 dark:bg-gray-950 dark:shadow-gray-500 md:relative",
          isOpen ? "w-64 p-4" : "w-16 p-2",
          // isDesktop ? "md:relative" : "fixed left-0 top-0",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="absolute -right-3 top-20 hidden justify-end rounded-full border bg-white p-1 dark:border-gray-500 dark:bg-gray-950 md:flex">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600 dark:text-gray-300"
          >
            {isOpen ? (
              <IconChevronLeft size={20} />
            ) : (
              <IconChevronRight size={20} />
            )}
          </button>
        </div>

        {/* Logo */}
        {/* {isOpen ? (
          <div className="flex text-3xl">
            <span className="font-nulshock text-black dark:text-white">
              WHS
            </span>
            <span className="font-nulshock text-primary">APP</span>
          </div>
        ) : (
          <span className="font-nulshock text-primary">WHS</span>
        )} */}
        <div className="flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="WHS Logo"
            width={isOpen ? 110 : 50} // bigger size when open
            height={isOpen ? 110 : 50}
            className="rounded-full object-contain"
          />
        </div>

        {/* User Info */}
        {isOpen && session.status === "authenticated" && (
          <div className="flex items-center gap-3 p-3">
            {session.data?.user?.imageUrl ? (
              <img
                src={session.data.user.imageUrl}
                alt="User"
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <IconUserFilled size={40} className="text-gray-400" />
            )}
            <div>
              <p className="text-xs uppercase text-gray-400">Welcome</p>
              <p className="text-sm font-medium capitalize text-gray-700 dark:text-white">
                {session.data.user.name ?? "User"}
              </p>
            </div>
          </div>
        )}

        <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent" />

        <nav className="mt-4 flex max-h-[58vh] flex-col gap-2 overflow-y-auto">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={
                session.status === "authenticated" ? item.path : "/auth/login"
              }
              onClick={async () => {
                if (toggleDrawer) toggleDrawer();
                if (item.path === "/auth/login")
                  await signOut({ callbackUrl: "/" });
              }}
            >
              <div
                className={`flex items-center gap-3 rounded-lg p-3 transition-all ${pathname === item.path ? "border border-[#ECE6E6] bg-[#F8F5F5] text-primary dark:border-gray-400 dark:bg-gray-700" : "text-gray-700 hover:bg-[#F8F5F5] dark:text-gray-300 dark:hover:bg-gray-700"}`}
              >
                <span
                  className={
                    pathname === item.path
                      ? "text-primary"
                      : "text-gray-500 dark:text-gray-300"
                  }
                >
                  {item.icon}
                </span>
                {isOpen && <span className="font-medium">{item.name}</span>}
              </div>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-10 w-3/4">
          {/* <Button
            title="Logout"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            variant="secondary"
            className="w-full"
            icon={<IconLogout size={20} />}
          /> */}
          <button
            className="flex w-full items-center gap-3 rounded-md bg-white p-3 text-primary shadow-md hover:bg-[#F8F5F5] dark:bg-gray-700 dark:shadow-gray-600"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <IconLogout size={20} />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
