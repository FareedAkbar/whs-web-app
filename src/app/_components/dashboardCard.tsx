"use client";
import React from "react";

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  onClick,
}) => {
  return (
    <div
      className="bg-primary items- flex cursor-pointer flex-col justify-center gap-3 rounded-[20px] p-6 shadow-lg transition-all hover:scale-105"
      onClick={onClick}
    >
      {/* Icon Wrapper */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
        <span className="text-primary text-2xl">{icon}</span>
      </div>

      {/* Title */}
      <p className="text-lg font-medium text-white">{title}</p>
    </div>
  );
};

export default DashboardCard;
