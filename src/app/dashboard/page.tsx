"use client";

import DashboardCard from "../_components/dashboardCard";

import {
  IconUsers,
  IconBriefcase,
  IconAlertCircle,
  IconCheck,
  IconClipboardList,
  IconClipboardX,
} from "@tabler/icons-react";

const dashboardItems = [
  {
    title: "Employee List",
    icon: <IconUsers size={32} />,
    value: 150, // Example count
    onClick: () => alert("Employee List Clicked"),
  },
  {
    title: "Contractor List",
    icon: <IconBriefcase size={32} />,
    value: 45, // Example count
    onClick: () => alert("Contractor List Clicked"),
  },
  {
    title: "Incidents",
    icon: <IconAlertCircle size={32} />,
    value: 12, // Example count
    onClick: () => alert("Incidents Clicked"),
  },
  {
    title: "Completed Tasks",
    icon: <IconCheck size={32} />,
    value: 230, // Example count
    onClick: () => alert("Completed Tasks Clicked"),
  },
  {
    title: "Assignable Tasks",
    icon: <IconClipboardList size={32} />,
    value: 18, // Example count
    onClick: () => alert("Assignable Tasks Clicked"),
  },
  {
    title: "Incomplete Tasks",
    icon: <IconClipboardX size={32} />,
    value: 8, // Example count
    onClick: () => alert("Incomplete Tasks Clicked"),
  },
];

const Dashboard = () => {
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
