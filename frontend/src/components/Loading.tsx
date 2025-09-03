import React from "react";

interface LoadingProps {
  message?: string;
  className?: string;
}

export default function Loading({
  message = "Loading...",
  className = "",
}: LoadingProps) {
  return (
    <div
      className={`flex justify-center items-center min-h-[calc(100vh-200px)] ${className}`}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
