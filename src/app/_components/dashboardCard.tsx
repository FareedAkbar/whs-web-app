"use client";
import React from "react";

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  value?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  onClick,
  value,
}) => {
  return (
    <div
      className="flex cursor-pointer flex-row items-center gap-3 rounded-[20px] bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105"
      onClick={onClick}
    >
      {/* Icon Wrapper */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
        <span className="text-2xl text-white">{icon}</span>
      </div>

      {/* Title */}
      <div className="flex flex-col items-start justify-center">
        <p className="text-lg font-medium text-primary">{title}</p>
        <p className="text-lg font-medium text-primary">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
