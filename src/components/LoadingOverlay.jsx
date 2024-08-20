import React from 'react';
import { Progress } from "@/components/ui/progress";

const LoadingOverlay = ({ isLoading, message }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">Loading...</h2>
        <p className="mb-4">{message}</p>
        <Progress value={66} className="w-full" />
      </div>
    </div>
  );
};

export default LoadingOverlay;