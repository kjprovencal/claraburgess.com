import ProtectedRoute from "@components/ProtectedRoute";
import React from "react";

export default function AboutMePage() {
  return (
    <ProtectedRoute>
      <AboutMeContent />
    </ProtectedRoute>
  );
}

function AboutMeContent() {
  return (
    <div className="mb-16">
      {/* Family Tree Section */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
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
                    Clara Burgess
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Due Date: December 19, 2025
                  </p>
                  {/* <Image src="/images/clara.jpg" alt="Clara" width={100} height={100} /> */}
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
                  {/* <Image src="/images/natalie.jpg" alt="Natalie" width={100} height={100} /> */}
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
                  {/* <Image src="/images/scott.jpg" alt="Scott" width={100} height={100} /> */}
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
                  {/* <Image src="/images/gordon.jpg" alt="Gordon" width={100} height={100} /> */}
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
                  {/* <Image src="/images/harriet.jpg" alt="Harriet" width={100} height={100} /> */}
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
                  {/* <Image src="/images/og-clara.jpg" alt="Original Clara Burgess" width={100} height={100} /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
