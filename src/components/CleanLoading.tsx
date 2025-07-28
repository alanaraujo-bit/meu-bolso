"use client";

interface CleanLoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function CleanLoading({ 
  text = "", 
  fullScreen = false
}: CleanLoadingProps) {
  const containerClass = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white" 
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={containerClass}>
      {/* Spinner único e clean */}
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
      
      {/* Texto opcional e discreto */}
      {text && (
        <p className="text-sm text-gray-500 font-medium">
          {text}
        </p>
      )}
    </div>
  );
}
