"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface LinkPreviewData {
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  url: string;
  price?: string;
  availability?: string;
}

interface LinkPreviewProps {
  url: string;
  className?: string;
  onPreviewLoaded?: (preview: LinkPreviewData) => void;
}

export default function LinkPreview({
  url,
  className = "",
  onPreviewLoaded,
}: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/registry/preview?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch preview");
      }

      const data = await response.json();
      setPreview(data);
      onPreviewLoaded?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
      console.error("Error fetching link preview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!url) return;

    fetchPreview();
  }, [url, onPreviewLoaded]);

  if (loading) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="animate-pulse bg-gray-200 rounded w-16 h-16 flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="animate-pulse bg-gray-200 rounded h-4 w-3/4"></div>
            <div className="animate-pulse bg-gray-200 rounded h-3 w-1/2"></div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">Loading preview...</div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 truncate">
              {preview?.title || "Preview unavailable"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {preview?.description || "Unable to load preview for this link"}
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 truncate">{url}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex">
        {/* Image */}
        {preview.imageUrl && (
          <div className="w-24 h-24 flex-shrink-0 relative">
            <Image
              src={preview.imageUrl}
              alt={preview.title || "Preview image"}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
              {preview.title}
            </h3>
            {preview.price && (
              <span className="text-sm font-bold text-pink-600 flex-shrink-0">
                {preview.price}
              </span>
            )}
          </div>

          {preview.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {preview.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">
              {preview.siteName || new URL(preview.url).hostname}
            </span>
            {preview.availability && (
              <span className="text-green-600 font-medium">
                {preview.availability}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
