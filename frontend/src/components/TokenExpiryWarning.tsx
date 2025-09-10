"use client";

import { useEffect, useState } from "react";
import { getTokenExpiration } from "@utils/auth";

export default function TokenExpiryWarning() {
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkExpiry = () => {
      const expiryTime = getTokenExpiration();
      if (!expiryTime) return;

      const now = Date.now();
      const timeLeft = expiryTime.getTime() - now;

      // Show warning when less than 30 minutes left
      if (timeLeft < 30 * 60 * 1000 && timeLeft > 0) {
        setShowWarning(true);
        setTimeUntilExpiry(Math.floor(timeLeft / 1000 / 60)); // minutes
      } else if (timeLeft <= 0) {
        setShowWarning(false);
      } else {
        setShowWarning(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">⚠️</span>
        <span className="text-sm">
          Session expires in {timeUntilExpiry} minutes
        </span>
      </div>
    </div>
  );
}
