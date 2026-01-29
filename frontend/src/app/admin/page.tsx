"use client";

import { useState, useEffect, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@components/ProtectedRoute";
import PhotoGalleryManager from "./components/PhotoGalleryManager";
import UserManager from "./components/UserManager";
import TokenExpiryWarning from "@components/TokenExpiryWarning";
import ZohoManager from "@/app/admin/components/ZohoManager";

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"photos" | "users" | "email">(
    "photos",
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["photos", "users", "email"].includes(tab)) {
      startTransition(() => {
        setActiveTab(tab as "photos" | "users" | "email");
      });
    }
  }, [searchParams]);

  return (
    <div className="mb-16">
      {/* Main Card Surface */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Subtle Background Pattern - Full Height */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>

        <div className="relative">
          <TokenExpiryWarning />
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold dark:text-gray-200">
              Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
              Managing Clara&apos;s photos and user accounts
            </p>
          </div>

          {/* Mobile-friendly tab navigation */}
          <div className="mb-6 sm:mb-8">
            {/* Mobile: Horizontal scroll tabs */}
            <div className="block sm:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setActiveTab("photos")}
                  className={`px-3 py-2 rounded-md font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === "photos"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-3 py-2 rounded-md font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === "users"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab("email")}
                  className={`px-3 py-2 rounded-md font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === "email"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            {/* Desktop: Full tab names */}
            <div className="hidden sm:flex gap-4">
              <button
                onClick={() => setActiveTab("photos")}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === "photos"
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
                }`}
              >
                Photos
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === "users"
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === "email"
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
                }`}
              >
                Email Setup
              </button>
            </div>
          </div>

          {activeTab === "photos" && <PhotoGalleryManager />}
          {activeTab === "users" && <UserManager />}
          {activeTab === "email" && <ZohoManager />}
        </div>
      </div>
    </div>
  );
}
