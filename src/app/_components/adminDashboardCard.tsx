"use client";
import React from "react";

interface AdminDashboardCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  value?: number;
}

const AdminDashboardCard: React.FC<AdminDashboardCardProps> = ({
  icon,
  title,
  onClick,
  value,
}) => {
  return (
    <div
      className="flex cursor-pointer flex-row items-center justify-between gap-3 rounded-[20px] border border-[#ECE6E6] bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105"
      onClick={onClick}
    >
      {/* Title */}
      <div className="flex flex-col items-start gap-4">
        <p className="font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      {/* Icon Wrapper */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
        <span className="text-2xl text-white">{icon}</span>
      </div>
    </div>
  );
};

export default AdminDashboardCard;
