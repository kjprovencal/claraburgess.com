"use client";

import React from "react";
import Image from "next/image";
import { RegistryItem } from "@types";
import { formatPrice } from "@utils/priceFormat";

type LinkPreviewProps = RegistryItem & {
  className?: string;
};

export default function LinkPreview({
  imageUrl,
  title,
  price,
  description,
  siteName,
  url,
  availability,
  className = "",
}: LinkPreviewProps) {
  const hostname = url ? new URL(url).hostname : "";
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-shadow ${className}`}
    >
      <div className="flex">
        {/* Image */}
        {imageUrl && (
          <div className="w-24 h-24 flex-shrink-0 relative">
            <Image
              src={imageUrl}
              alt={title || "Preview image"}
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
              {title}
            </h3>
            <span className="text-sm font-bold text-pink-600 flex-shrink-0">
              {price ? formatPrice(price) : "Unknown price"}
            </span>
          </div>

          {description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            {(siteName || hostname) && (
              <span className="truncate">{siteName || hostname}</span>
            )}
            {availability && (
              <span className="text-green-600 font-medium">{availability}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
