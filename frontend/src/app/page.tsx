"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { PiTreeStructureLight } from "react-icons/pi";
import { BsBagHeartFill, BsEnvelope } from "react-icons/bs";
import { BiSolidPhotoAlbum } from "react-icons/bi";
import { MdPeopleOutline } from "react-icons/md";

export default function Home() {
  const dueDate = "2025-12-19"; // December 19, 2025

  const durationInMonths = dayjs(dueDate).diff(dayjs(), "months");
  const durationInDays = dayjs(dueDate).diff(dayjs(), "days");
  let durationText = "";
  if (durationInMonths > 0) {
    const leftoverDays = dayjs(dueDate).diff(
      dayjs().add(durationInMonths, "months"),
      "days"
    );
    durationText = `${durationInMonths} months`;
    if (leftoverDays > 0) {
      durationText += ` and ${leftoverDays} days`;
    }
  } else {
    durationText = `${durationInDays} days`;
  }

  return (
    <div className="mb-16">
      {/* Main Card Surface */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
        {/* Subtle Background Pattern - Full Height */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>
        
        <div className="relative">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <Image
                src="/main.jpg"
                alt="Clara's Baby Registry"
                width={200}
                height={200}
                priority
                className="rounded-full border-4 border-pink-200 shadow-lg mx-auto"
              />
            </div>

            <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Clara&apos;s World!
            </h1>

            <p className="text-xl max-w-2xl text-center text-gray-600 leading-relaxed mx-auto">
              We are so excited to welcome our precious daughter Clara{" "}
              into this world! Here you can find our baby registry, browse photos of
              our journey, and share in our joy.
              <br />
              <br />
              This website is our way of keeping friends and family connected during
              this special time. Whether you&apos;re here to help with our registry or
              just want to see how we&apos;re doing, we&apos;re grateful for your love and
              support.
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="w-full max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-200">
              Counting Down to Clara&apos;s Arrival
            </h2>
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-2xl font-bold py-4 px-2 rounded-lg shadow-lg">
                <div className="mt-2 capitalize">{durationText}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto mb-12">
            <Link href="/registry" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BsBagHeartFill className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">
                    Baby Registry
                  </h3>
                  <p className="text-blue-600">
                    Help us prepare for Clara&apos;s arrival with items from
                    our carefully curated registry
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/photos" className="group">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-xl border-2 border-pink-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BiSolidPhotoAlbum className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-pink-800 mb-2">
                    Photo Gallery
                  </h3>
                  <p className="text-pink-600">
                    Follow our journey through pregnancy and watch Clara{" "}
                    grow
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/about-me" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border border-purple-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <PiTreeStructureLight className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-purple-800 mb-2">
                    About Clara Burgess
                  </h3>
                  <p className="text-purple-600">
                    Learn more about Clara&apos;s namesake and the Burgess lineage
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/about-us" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MdPeopleOutline className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    About Us
                  </h3>
                  <p className="text-green-600">
                    Learn more about us and our journey to parenthood.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Have Questions?
            </h3>
            <p className="text-gray-600">
              Feel free to reach out to us directly, or use the contact form below.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Link
                href="mailto:kyle@kprovencal.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                <BsEnvelope className="w-4 h-4" />
                Send Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
