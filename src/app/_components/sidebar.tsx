import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Settings, Mail } from "lucide-react"; // Using lucide-react icons

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", icon: <Home size={20} />, path: "/" },
    { name: "Profile", icon: <User size={20} />, path: "/profile" },
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
    { name: "Messages", icon: <Mail size={20} />, path: "/messages" },
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { name: "Analytics", icon: <User size={20} />, path: "/analytics" },
    { name: "Reports", icon: <Settings size={20} />, path: "/reports" },
    { name: "Notifications", icon: <Mail size={20} />, path: "/notifications" },
    { name: "Users", icon: <User size={20} />, path: "/users" },
    { name: "Settings", icon: <Settings size={20} />, path: "/settings2" },
    { name: "Support", icon: <Mail size={20} />, path: "/support" },
  ];

  return (
    <div className="absolute left-0 flex h-[80vh] w-64 flex-col bg-white p-4 shadow-md">
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
