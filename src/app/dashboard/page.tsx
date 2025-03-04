"use client";
import {
  IconUsers,
  IconBriefcase,
  IconTools,
  IconAlertTriangle,
  IconFlask,
  IconUsersGroup,
} from "@tabler/icons-react";
import DashboardCard from "../_components/dashboardCard";

const dashboardItems = [
  {
    title: "Employee List",
    icon: <IconUsers size={32} />,
    onClick: () => alert("Employee List Clicked"),
  },
  {
    title: "Contractor List",
    icon: <IconBriefcase size={32} />,
    onClick: () => alert("Contractor List Clicked"),
  },
  {
    title: "Maintenance",
    icon: <IconTools size={32} />,
    onClick: () => alert("Maintenance Clicked"),
  },
  {
    title: "Hazards",
    icon: <IconAlertTriangle size={32} />,
    onClick: () => alert("Hazards Clicked"),
  },
  {
    title: "Chemical List",
    icon: <IconFlask size={32} />,
    onClick: () => alert("Chemical List Clicked"),
  },
  {
    title: "Committee",
    icon: <IconUsersGroup size={32} />,
    onClick: () => alert("Committee Clicked"),
  },
];

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
      {dashboardItems.map((item, index) => (
        <DashboardCard
          key={index}
          icon={item.icon}
          title={item.title}
          onClick={item.onClick}
        />
      ))}
    </div>
  );
};

export default Dashboard;
