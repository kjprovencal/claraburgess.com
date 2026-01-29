"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

type ExpandedImage = { src: string; alt: string } | null;

export default function AboutMePage() {
  const [expandedImage, setExpandedImage] = useState<ExpandedImage>(null);

  const closeLightbox = useCallback(() => setExpandedImage(null), []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    if (expandedImage) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [expandedImage, closeLightbox]);

  return (
    <div className="mb-16">
      {/* Family Tree Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Subtle Background Pattern - Full Height */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
          The Clara Burgess Lineage
        </h1>

        <div className="relative">
          {/* Vertical Timeline Line - Mobile: Left, Desktop: Centered */}
          <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-px w-1 bg-gradient-to-b from-pink-400 via-purple-400 to-blue-400 h-full shadow-lg"></div>

          {/* Family Generations */}
          <div className="space-y-16">
            {/* Current Generation - Baby Clara */}
            <div className="relative flex items-center">
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-pink-500 rounded-full border-4 border-white shadow-xl z-10 ring-4 ring-pink-100"></div>
              {/* Card - Mobile: Right side, Desktop: Right side */}
              <div className="w-full md:w-5/12 ml-16 md:ml-auto bg-white rounded-2xl shadow-xl p-6 md:border-l-4 border-pink-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-pink-600 mb-2">
                    Clara Burgess Provencal
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Born: December 21, 2025
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedImage({ src: "/clara.jpeg", alt: "Clara" })
                    }
                    className="relative w-28 h-28 mx-auto overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-md mt-3 block cursor-pointer hover:ring-2 hover:ring-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <Image
                      src="/clara.jpeg"
                      alt="Clara"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Parents Generation */}
            <div className="relative flex items-center">
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-500 rounded-full border-4 border-white shadow-xl z-10 ring-4 ring-purple-100"></div>
              {/* Card - Mobile: Right side, Desktop: Left side */}
              <div className="w-full md:w-5/12 ml-16 md:mr-auto bg-white rounded-2xl shadow-xl p-6 md:border-r-4 border-purple-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-purple-600 mb-2">
                    Natalie Pratt Provencal
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">(Mother)</p>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Born:</strong> March 18, 2000 in Portland, Maine
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedImage({
                        src: "/natalie.jpeg",
                        alt: "Natalie",
                      })
                    }
                    className="relative w-28 h-28 mx-auto overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-md mt-3 block cursor-pointer hover:ring-2 hover:ring-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <Image
                      src="/natalie.jpeg"
                      alt="Natalie"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Grandparents Generation */}
            <div className="relative flex items-center">
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-xl z-10 ring-4 ring-blue-100"></div>
              {/* Card - Mobile: Right side, Desktop: Right side */}
              <div className="w-full md:w-5/12 ml-16 md:ml-auto bg-white rounded-2xl shadow-xl p-6 md:border-l-4 border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-blue-600 mb-2">
                    Scott Edwardes Pratt
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">(Grandfather)</p>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Born:</strong> November 25, 1960 in Camp Springs,
                      Maryland
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedImage({ src: "/scott.jpeg", alt: "Scott" })
                    }
                    className="relative w-28 h-28 mx-auto overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-md mt-3 block cursor-pointer hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Image
                      src="/scott.jpeg"
                      alt="Scott"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Great-Grandparents Generation */}
            <div className="relative flex items-center">
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-xl z-10 ring-4 ring-green-100"></div>
              {/* Card - Mobile: Right side, Desktop: Left side */}
              <div className="w-full md:w-5/12 ml-16 md:mr-auto bg-white rounded-2xl shadow-xl p-6 md:border-r-4 border-green-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-green-600 mb-2">
                    Gordon Burgess Pratt
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    (Great-Grandfather)
                  </p>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Born:</strong> February 24, 1931 in Chatham,
                      Massachusetts
                    </p>
                    <p>
                      <strong>Died:</strong> May 3, 2023 in Chatham,
                      Massachusetts
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedImage({
                        src: "/gordon.jpeg",
                        alt: "Gordon",
                      })
                    }
                    className="relative w-28 h-28 mx-auto overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-md mt-3 block cursor-pointer hover:ring-2 hover:ring-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <Image
                      src="/gordon.jpeg"
                      alt="Gordon"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Great-Great-Grandparents Generation */}
            <div className="relative flex items-center">
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-xl z-10 ring-4 ring-red-100"></div>
              {/* Card - Mobile: Right side, Desktop: Right side */}
              <div className="w-full md:w-5/12 ml-16 md:ml-auto bg-white rounded-2xl shadow-xl p-6 md:border-l-4 border-red-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-red-600 mb-2">
                    Harriet Louise
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    (Great-Great-Grandmother)
                  </p>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Born:</strong> February 22, 1905 in Chatham,
                      Massachusetts
                    </p>
                    <p>
                      <strong>Died:</strong> April 24, 1997 in Chatham,
                      Massachusetts
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedImage({
                        src: "/harriet.jpeg",
                        alt: "Harriet",
                      })
                    }
                    className="relative w-28 h-28 mx-auto overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-md mt-3 block cursor-pointer hover:ring-2 hover:ring-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Image
                      src="/harriet.jpeg"
                      alt="Harriet"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Original Clara Burgess */}
            <div className="relative flex items-center">
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full border-4 border-white shadow-xl z-10 ring-4 ring-pink-100"></div>
              {/* Card - Mobile: Right side, Desktop: Left side */}
              <div className="w-full md:w-5/12 ml-16 md:mr-auto bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl shadow-xl p-6 md:border-r-4 border-pink-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-pink-600 mb-2">
                    Clara Burgess
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    (Great-Great-Great-Grandmother)
                  </p>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Born:</strong> June 24, 1868 in Chatham,
                      Massachusetts
                    </p>
                    <p>
                      <strong>Died:</strong> March 7, 1941 in Chatham,
                      Massachusetts
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedImage({
                        src: "/og-clara.jpeg",
                        alt: "Original Clara Burgess",
                      })
                    }
                    className="relative w-28 h-28 mx-auto overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-md mt-3 block cursor-pointer hover:ring-2 hover:ring-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <Image
                      src="/og-clara.jpeg"
                      alt="Original Clara Burgess"
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image lightbox - portaled to body so it centers in the viewport */}
      {expandedImage &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`View full size: ${expandedImage.alt}`}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <div
              className="relative w-[90vw] h-[90vh] max-w-4xl max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={expandedImage.src}
                alt={expandedImage.alt}
                fill
                className="object-contain rounded-lg shadow-2xl"
                sizes="90vw"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
