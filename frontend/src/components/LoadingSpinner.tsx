interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "pink" | "blue" | "gray";
}

export default function LoadingSpinner({ size = "md", color = "pink" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const colorClasses = {
    pink: "border-pink-500",
    blue: "border-blue-500",
    gray: "border-gray-500"
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`}
    />
  );
}
