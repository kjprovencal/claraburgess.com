"use client";

import React, { useState, useEffect } from "react";
import { Photo } from "@types";
import { FaTrash } from "react-icons/fa";
import { authenticatedFetch } from "@utils/auth";
import Image from "next/image";

type PhotoForm = Pick<Photo, "alt" | "caption" | "date" | "category">;

const photoCategories = ["Ultrasound", "Bump", "Celebration"];

export default function PhotoGalleryManager() {
  const [photoForm, setPhotoForm] = useState<PhotoForm>({
    alt: "",
    caption: "",
    date: new Date().toISOString().split("T")[0],
    category: "Ultrasound",
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchPhotos = async () => {
    try {
      const response = await authenticatedFetch("/api/photos");
      if (!response.ok) throw new Error("Failed to fetch photos");
      const data = await response.json();
      setPhotos(data);
    } catch (err) {
      console.error("Failed to fetch photos:", err);
    }
  };

  const handleSubmitPhoto = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a photo file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("alt", photoForm.alt);
      formData.append("caption", photoForm.caption);
      formData.append("date", photoForm.date);
      formData.append("category", photoForm.category);

      const response = await authenticatedFetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload photo");

      await fetchPhotos();
      setPhotoForm({
        alt: "",
        caption: "",
        date: new Date().toISOString().split("T")[0],
        category: "Ultrasound",
      });
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to upload photo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await authenticatedFetch(`/api/photos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete photo");
      await fetchPhotos();
    } catch (err) {
      console.error("Failed to delete photo:", err);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <>
      {/* Add New Photo Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-gray-900">
          Add New Photo
        </h2>

        <form
          onSubmit={handleSubmitPhoto}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={photoForm.category}
              onChange={(e) =>
                setPhotoForm({ ...photoForm, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
            >
              {photoCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={photoForm.date}
              onChange={(e) =>
                setPhotoForm({ ...photoForm, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={photoForm.alt}
              onChange={(e) =>
                setPhotoForm({ ...photoForm, alt: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption
            </label>
            <textarea
              value={photoForm.caption}
              onChange={(e) =>
                setPhotoForm({ ...photoForm, caption: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
              rows={3}
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
        </form>
      </div>

      {/* Photos List */}
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold p-6 border-b dark:text-gray-900">
          Current Photos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="border rounded-lg overflow-hidden relative"
            >
              <Image
                src={photo.url}
                alt={photo.alt}
                width={32}
                height={32}
                objectFit="cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 dark:text-gray-900">
                  {photo.alt}
                </h3>
                <p className="text-sm text-gray-600 mb-2 dark:text-gray-900">
                  {photo.caption}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-3 dark:text-gray-900">
                  <span>{photo.category}</span>
                  <span>{new Date(photo.date).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
