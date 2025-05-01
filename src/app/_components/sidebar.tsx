"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconHome,
  IconAlertTriangle,
  IconUsers,
  IconUser,
  IconTable,
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
    {
      name: "Incidents",
      icon: <IconAlertTriangle size={20} />,
      path: "/dashboard/incidents",
    },
  ];

  if (user) {
    const role = user.role;

    if (role === "ADMIN") {
      navItems.push(
        {
          name: "Contractors",
          icon: <IconUsers size={20} />,
          path: "/dashboard/contractors",
        },
        {
          name: "Employees",
          icon: <IconTable size={20} />,
          path: "/dashboard/employees",
        },
        {
          name: "Users",
          icon: <IconUser size={20} />,
          path: "/dashboard/users",
        },
        {
          name: "Inspections Checklist",
          icon: <IconChecklist size={20} />,
          path: "/dashboard/inspections-checklist",
        },
      );
    }

    navItems.push({
      name: "Profile",
      icon: <IconUserCircle size={20} />,
      path: "/dashboard/profile",
    });
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
          "fixed left-0 top-0 z-50 h-full w-64 bg-white p-4 shadow-md transition-all duration-300 md:relative",
          isOpen ? "w-64 p-4" : "w-16 p-2",
          // isDesktop ? "md:relative" : "fixed left-0 top-0",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="absolute -right-3 top-10 hidden justify-end rounded-full border bg-white p-1 md:flex">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500">
            {isOpen ? (
              <IconChevronLeft size={20} />
            ) : (
              <IconChevronRight size={20} />
            )}
          </button>
        </div>

        {/* Logo */}
        {isOpen ? (
          <div className="font-nulshock flex text-3xl">
            <span className="text-black">WHS</span>
            <span className="text-primary">APP</span>
          </div>
        ) : (
          <span className="font-nulshock text-primary">WHS</span>
        )}

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
              <p className="text-sm font-medium capitalize text-gray-700">
                {session.data.user.name ?? "User"}
              </p>
            </div>
          </div>
        )}

        <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent" />

        <nav className="mt-4 flex flex-col gap-2">
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
                className={`flex items-center gap-3 rounded-lg p-3 transition-all ${pathname === item.path ? "border border-[#ECE6E6] bg-[#F8F5F5] text-primary" : "text-gray-700 hover:bg-[#F8F5F5]"}`}
              >
                <span
                  className={
                    pathname === item.path ? "text-primary" : "text-gray-500"
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
          <button
            className="flex w-full items-center gap-3 rounded-md bg-white p-3 text-primary shadow-md hover:bg-[#F8F5F5]"
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
