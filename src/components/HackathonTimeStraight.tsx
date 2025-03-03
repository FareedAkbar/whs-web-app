"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";

const HackathonTimeStraight = ({ isVisible, timeAttack }: { isVisible: boolean, timeAttack: ChallengeSetTimer }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    if (!timeAttack?.endDateTime) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endDateTime = timeAttack?.endDateTime ?? new Date().toISOString();
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
  }, [timeAttack]);

  return (
    <div className={`flex items-center justify-center font-mont p-3 rounded-full text-white transition-opacity duration-300 cursor-pointer ${isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        cursor: 'pointer',
        pointerEvents: isVisible ? 'auto' : 'none'
      }} >
      <div className="font-bold dark:text-white text-white text-sm flex gap-2">
        <p className="font-mono text-sm font-light">{timeLeft.hours} : {timeLeft.minutes} : {timeLeft.seconds}</p>
      </div>
    </div>
  );
};

export default HackathonTimeStraight;
