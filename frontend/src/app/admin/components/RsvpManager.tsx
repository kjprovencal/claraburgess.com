"use client";

import React, { useState, useEffect } from "react";
import { authenticatedFetch } from "@utils/auth";
import LoadingSpinner from "@components/LoadingSpinner";

interface Rsvp {
  id: number;
  name: string;
  email: string;
  attending: "yes" | "no";
  guestCount: number;
  dietaryRestrictions?: string;
  message?: string;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RsvpStats {
  total: number;
  attending: number;
  notAttending: number;
  totalGuests: number;
}

export default function RsvpManager() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [stats, setStats] = useState<RsvpStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "attending" | "not-attending">(
    "all"
  );

  useEffect(() => {
    fetchRsvps();
    fetchStats();
  }, []);

  const fetchRsvps = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch("/api/baby-shower/rsvp");

      if (!response.ok) {
        throw new Error("Failed to fetch RSVPs");
      }

      const data = await response.json();
      setRsvps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch RSVPs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch("/api/baby-shower/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const filteredRsvps = rsvps?.filter((rsvp) => {
    if (filter === "attending") return rsvp.attending === "yes";
    if (filter === "not-attending") return rsvp.attending === "no";
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" color="pink" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchRsvps}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Baby Shower RSVPs</h2>
        <button
          onClick={fetchRsvps}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
            <h3 className="text-sm font-medium text-pink-800">Total RSVPs</h3>
            <p className="text-2xl font-bold text-pink-600">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800">Attending</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.attending}
            </p>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800">Not Attending</h3>
            <p className="text-2xl font-bold text-red-600">
              {stats.notAttending}
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800">Total Guests</h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalGuests}
            </p>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === "all"
              ? "bg-pink-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({rsvps.length})
        </button>
        <button
          onClick={() => setFilter("attending")}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === "attending"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Attending ({rsvps?.filter((r) => r.attending === "yes").length})
        </button>
        <button
          onClick={() => setFilter("not-attending")}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === "not-attending"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Not Attending ({rsvps?.filter((r) => r.attending === "no").length})
        </button>
      </div>

      {/* RSVP List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredRsvps.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No RSVPs found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rsvp.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rsvp.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rsvp.attending === "yes"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rsvp.attending === "yes"
                          ? "Attending"
                          : "Not Attending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rsvp.guestCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rsvp.emailSent
                            ? "bg-green-100 text-green-800"
                            : rsvp.attending === "no"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {rsvp.emailSent
                          ? "Sent"
                          : rsvp.attending === "yes"
                            ? "Pending"
                            : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(rsvp.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RSVP Details Modal (if needed) */}
      {filteredRsvps.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            RSVP Details
          </h3>
          <div className="space-y-4">
            {filteredRsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{rsvp.name}</h4>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      rsvp.attending === "yes"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {rsvp.attending === "yes" ? "Attending" : "Not Attending"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rsvp.email}</p>
                {rsvp.attending === "yes" && (
                  <>
                    <p className="text-sm text-gray-600">
                      <strong>Guests:</strong> {rsvp.guestCount}
                    </p>
                    {rsvp.dietaryRestrictions && (
                      <p className="text-sm text-gray-600">
                        <strong>Dietary Restrictions:</strong>{" "}
                        {rsvp.dietaryRestrictions}
                      </p>
                    )}
                  </>
                )}
                {rsvp.message && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Message:</strong> &quot;{rsvp.message}&quot;
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Submitted: {formatDate(rsvp.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
