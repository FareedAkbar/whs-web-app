"use client";
import React from "react";

interface WorkerDashboardCardProps {
  title: string;
  onClick: () => void;
  percentage: number; // value from 0 to 100
  total?: number; // optional, if you want to show total value
}

const WorkerDashboardCard: React.FC<WorkerDashboardCardProps> = ({
  title,
  onClick,
  percentage,
  total,
}) => {
  const radius = 28;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="flex cursor-pointer flex-row items-center justify-between gap-3 rounded-[20px] border border-[#ECE6E6] bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 dark:border-gray-500 dark:bg-gray-900"
      onClick={onClick}
    >
      {/* Title and Value */}
      <div className="flex flex-col items-start gap-4">
        <p className="font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold dark:text-white">{total}</p>
      </div>

      {/* Circular Progress */}
      <div className="relative h-16 w-16">
        <svg
          height="100%"
          width="100%"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          <circle
            stroke="#E5707040"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#EC1C29" // or use your Tailwind class via style if needed
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
          {percentage}%
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboardCard;
