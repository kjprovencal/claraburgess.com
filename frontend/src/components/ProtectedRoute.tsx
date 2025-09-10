"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Store the intended destination and redirect to login
        const returnUrl = encodeURIComponent(pathname);
        console.log(
          `🔒 Protected route accessed: ${pathname}, redirecting to login with returnTo=${returnUrl}`,
        );
        router.push(`/login?returnTo=${returnUrl}`);
      } else if (requireAdmin && !isAdmin) {
        console.log(
          `🚫 Admin access required for ${pathname}, redirecting to home`,
        );
        router.push("/");
      }
    }
  }, [user, isLoading, isAdmin, requireAdmin, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
