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
} from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { use, useEffect, useState } from "react";
import { hasPermission } from "@/lib/auth";

const Sidebar = () => {
  const pathname = usePathname();
  const session = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  useEffect(() => {
    void session.update();
  }, []);
  const user = session.data?.user;
  const navItems = [];

  if (user) {
    const role = user.role;

    // Always show Home and Incidents
    navItems.push(
      { name: "Home", icon: <IconHomeFilled size={20} />, path: "/dashboard" },
      {
        name: "Incidents",
        icon: <IconAlertTriangle size={20} />,
        path: "/dashboard/incidents",
      },
    );

    // Admin sees everything
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
      );
    }

    // Always show profile
    navItems.push({
      name: "Profile",
      icon: <IconUserCircle size={20} />,
      path: "/dashboard/profile",
    });
  }
  return (
    <div
      className={`relative h-screen border-r bg-white transition-all ${isOpen ? "w-64 p-4" : "w-16 p-2"}`}
    >
      {/* Toggle Button */}
      <div className="absolute -right-3 top-10 flex justify-end rounded-full border bg-white p-1">
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500">
          {isOpen ? (
            <IconChevronLeft size={20} />
          ) : (
            <IconChevronRight size={20} />
          )}
        </button>
      </div>

      {/* Logo */}
      {!isOpen ? (
        <span className="font-nulshock text-red-700">WHS</span>
      ) : (
        <div
          className="font-nulshock flex cursor-pointer text-3xl"
          // onClick={() => router.push("/dashboard")}
        >
          <span className="text-black">WHS</span>
          <span className="text-red-700">APP</span>
        </div>
      )}

      {/* User Info */}
      {isOpen && session.status === "authenticated" && (
        <div className="flex items-center gap-3 p-3">
          {session.data?.user?.imageUrl ? (
            <img
              src={session.data?.user?.imageUrl}
              alt="User"
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <IconUserFilled size={40} className="text-gray-400" />
          )}
          <div>
            <p className="text-xs uppercase text-gray-400">Welcome</p>
            <p className="text-sm font-medium capitalize text-gray-700">
              {session.data?.user?.name ?? "User"}
            </p>
          </div>
        </div>
      )}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent" />

      {/* Navigation */}
      <nav className="mt-4 flex flex-col gap-2">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={
              session.status === "authenticated" ? item.path : "/auth/login"
            }
          >
            <div
              className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all ${pathname === item.path ? "border border-[#ECE6E6] bg-[#F8F5F5] text-red-600" : "text-gray-700 hover:bg-[#F8F5F5]"}`}
            >
              <span
                className={
                  pathname === item.path ? "text-red-600" : "text-gray-500"
                }
              >
                {item.icon}
              </span>
              {isOpen && <span className="font-medium">{item.name}</span>}
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-10 w-3/4">
        <button
          className="flex w-full items-center gap-3 rounded-md bg-white p-3 text-red-600 shadow-md hover:bg-[#F8F5F5]"
          onClick={() => {
            signOut({ callbackUrl: "/auth/login" });
            // router.push("/auth/login");
          }}
        >
          <IconLogout size={20} />
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
