"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconAlertTriangle,
  IconUsers,
  IconUser,
} from "@tabler/icons-react"; // Importing Tabler icons

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", icon: <IconHome size={20} />, path: "/dashboard" },
    {
      name: "Incidents",
      icon: <IconAlertTriangle size={20} />,
      path: "/incidents",
    },
    {
      name: "Contractors",
      icon: <IconUsers size={20} />,
      path: "/contractors",
    },
    { name: "Users", icon: <IconUser size={20} />, path: "/users" },
  ];

  return (
    <div className="absolute left-10 top-28 flex max-h-[80vh] w-64 flex-col rounded-r-lg bg-white p-4 shadow-md">
      <nav className="custom-scrollbar flex h-full flex-col gap-2 overflow-y-auto">
        {navItems.map((item, index) => (
          <Link key={index} href={item.path}>
            <div
              className={`flex cursor-pointer items-center gap-3 rounded-md p-3 transition-all ${
                pathname === item.path ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <span className="text-gray-600">{item.icon}</span>
              <span className="font-medium text-gray-700">{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
