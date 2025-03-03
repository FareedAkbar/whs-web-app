"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";

const HackathonTime = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const { data: hackathonTime, isLoading, error } = api.hackathon.getHackathonTime.useQuery();

  useEffect(() => {
    if (!hackathonTime?.data[0]?.endDateTime) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endDateTime = hackathonTime.data[0]?.endDateTime ?? new Date().toISOString();
      const end = new Date(endDateTime);
      const difference = end.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
          minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, "0"),
          seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, "0"),
        });
      } else {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [hackathonTime?.data[0]?.endDateTime]);

  return (
    <div className="fixed left-0 top-1/2 -translate-x-20 flex items-center justify-center">
      <div className="font-bold text-white text-sm -rotate-90 bg-red-500 p-4 rounded-b-lg">
        Time Remaining: {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
      </div>
    </div>
  );
};

export default HackathonTime;
