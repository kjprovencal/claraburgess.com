"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setIsTransitioning(true);

    // Small delay to show the transition
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setKey((prev) => prev + 1);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {isTransitioning && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <LoadingSpinner size="lg" color="pink" />
          </div>
        </div>
      )}
      <div
        key={key}
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          isTransitioning
            ? "opacity-0 transform translate-y-2"
            : "opacity-100 transform translate-y-0"
        }`}
        style={{
          willChange: isTransitioning ? "opacity, transform" : "auto",
        }}
      >
        {children}
      </div>
    </>
  );
}
