"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "@components/ProtectedRoute";
import { Photo } from "@types";

const categories = ["All", "Ultrasound", "Bump", "Celebration"];

export default function PhotosPage() {
  return (
    <ProtectedRoute>
      <PhotosContent />
    </ProtectedRoute>
  );
}

function PhotosContent() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/photos");
      if (!response.ok) {
        throw new Error("Failed to fetch photos");
      }
      const data = await response.json();
      setPhotos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos = photos.filter(
    (photo) =>
      selectedCategory === "All" || photo.category === selectedCategory,
  );

  useEffect(() => {
    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading precious memories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">
          Oops! Something went wrong
        </div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchPhotos}
          className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-16">
        {/* Main Card Surface */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          {/* Subtle Background Pattern - Full Height */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>

          <div className="relative">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                Clara&apos;s Photo Gallery
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Watch our journey as we prepare to welcome our little miracle
              </p>

              {/* Category Filters */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                        {photo.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(photo.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {photo.alt}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredPhotos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No photos found in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.alt}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                  {selectedPhoto.category}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedPhoto.date).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {selectedPhoto.alt}
              </h3>
              <p className="text-gray-600 mb-4">{selectedPhoto.caption}</p>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
