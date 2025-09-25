"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  BsCalendar3,
  BsClock,
  BsFillPinMapFill,
  BsGift,
  BsEnvelope,
  BsJournalAlbum,
} from "react-icons/bs";
import { FaBaby, FaHeart, FaUtensils } from "react-icons/fa";

export default function BabyShowerPage() {
  const [rsvpData, setRsvpData] = useState({
    name: "",
    email: "",
    attending: "",
    guestCount: 1,
    dietaryRestrictions: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setRsvpData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/baby-shower/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rsvpData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit RSVP");
      }

      const result = await response.json();
      console.log("RSVP submitted successfully:", result);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      alert(
        `There was an error submitting your RSVP: ${error instanceof Error ? error.message : "Please try again."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>

            <div className="relative text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="w-12 h-12 text-green-500" />
              </div>

              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Thank You for Your RSVP!
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                We&apos;re so excited to celebrate with you! We&apos;ll send you
                a confirmation email shortly.
              </p>

              <div className="bg-gradient-to-r from-pink-100 to-blue-100 rounded-2xl p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  What&apos;s Next?
                </h2>
                <div className="text-left space-y-3">
                  <div className="flex items-center gap-3">
                    <BsEnvelope className="w-5 h-5 text-pink-500" />
                    <span className="text-gray-700">
                      Check your email for confirmation details
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BsCalendar3 className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">
                      Add the event to your calendar
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BsGift className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">
                      Check out our registry if you&apos;d like to bring a gift
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/registry"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <BsGift className="w-4 h-4" />
                  View Registry
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaBaby className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Main Card Surface */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>

          <div className="relative">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-200 to-blue-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <FaBaby className="w-16 h-16 text-pink-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✨</span>
                </div>
              </div>

              <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Baby Shower Invitation
              </h1>

              <p className="text-xl max-w-2xl text-center text-gray-600 leading-relaxed mx-auto mb-8">
                You&apos;re invited to celebrate the upcoming arrival of Clara
                B!
              </p>
            </div>

            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
                  <BsCalendar3 className="w-6 h-6 text-pink-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Date</h3>
                    <p className="text-gray-600">Sunday, October 26th, 2025</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <BsClock className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Time</h3>
                    <p className="text-gray-600">2:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <BsFillPinMapFill className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Location
                    </h3>
                    <p className="text-gray-600">
                      30 Winslow Rd
                      <br />
                      Gorham, Maine 04038
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <FaUtensils className="w-6 h-6 text-purple-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Food & Drinks
                    </h3>
                    <p className="text-gray-600">
                      Light refreshments, desserts, and beverages will be served
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                  <BsJournalAlbum className="w-6 h-6 text-yellow-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Activities
                    </h3>
                    <p className="text-gray-600">
                      Mingling, scrapbooking, and celebrating Clara&apos;s
                      upcoming arrival
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl">
                  <BsGift className="w-6 h-6 text-pink-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Registry
                    </h3>
                    <p className="text-gray-600">
                      Gifts are optional but appreciated. Check out our
                      registry!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RSVP Form */}
            <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                Please RSVP
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={rsvpData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={rsvpData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Will you be attending? *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-pink-300 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="attending"
                        value="yes"
                        checked={rsvpData.attending === "yes"}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-gray-700 font-medium">
                        Yes, I&apos;ll be there! 🎉
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-pink-300 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="attending"
                        value="no"
                        checked={rsvpData.attending === "no"}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-gray-700 font-medium">
                        Sorry, I can&apos;t make it 😔
                      </span>
                    </label>
                  </div>
                </div>

                {rsvpData.attending === "yes" && (
                  <>
                    <div>
                      <label
                        htmlFor="guestCount"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Number of Guests
                      </label>
                      <select
                        id="guestCount"
                        name="guestCount"
                        value={rsvpData.guestCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                      >
                        <option value={1}>Just me</option>
                        <option value={2}>2 guests</option>
                        <option value={3}>3 guests</option>
                        <option value={4}>4 guests</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="dietaryRestrictions"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Dietary Restrictions or Allergies
                      </label>
                      <textarea
                        id="dietaryRestrictions"
                        name="dietaryRestrictions"
                        value={rsvpData.dietaryRestrictions}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                        placeholder="Please let us know about any dietary restrictions or allergies..."
                      />
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message for the Parents-to-Be
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={rsvpData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    placeholder="Share your excitement, well wishes, or any special message..."
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting RSVP...
                      </>
                    ) : (
                      <>
                        <FaHeart className="w-5 h-5" />
                        Submit RSVP
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                Questions? Contact us at{" "}
                <Link
                  href="mailto:admin@claraburgess.com"
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  admin@claraburgess.com
                </Link>
              </p>
              <p className="text-sm text-gray-500">
                We can&apos;t wait to celebrate with you! 💕
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
