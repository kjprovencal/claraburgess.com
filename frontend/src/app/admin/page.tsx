"use client";

import React, { useState } from "react";
import ProtectedRoute from "@components/ProtectedRoute";
import RegistryManager from "./components/RegistryManager";
import PhotoGalleryManager from "./components/PhotoGalleryManager";
import UserManager from "./components/UserManager";
import TokenExpiryWarning from "@components/TokenExpiryWarning";

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const [activeTab, setActiveTab] = useState<"registry" | "photos" | "users">("registry");

  return (
    <div className="mb-16">
      {/* Main Card Surface */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
        {/* Subtle Background Pattern - Full Height */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>
        
        <div className="relative">
          <TokenExpiryWarning />
          <div className="mb-8">
            <h1 className="text-3xl font-bold dark:text-gray-800">Admin Panel</h1>
            <p className="text-gray-600 mt-1">
              Managing Clara's registry and photos
            </p>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("registry")}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === "registry"
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
              }`}
            >
              Registry Items
            </button>
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
                  : "bg-gray-200 text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
              }`}
            >
              Users
            </button>
          </div>

          {activeTab === "registry" && <RegistryManager />}
          {activeTab === "photos" && <PhotoGalleryManager />}
          {activeTab === "users" && <UserManager />}
        </div>
      </div>
    </div>
  );
}
