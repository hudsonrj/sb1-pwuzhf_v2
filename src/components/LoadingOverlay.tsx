import React from 'react';
import { Loader } from 'lucide-react';

const LoadingOverlay: React.FC = () => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 animate-pulse"></div>
        <Loader className="absolute inset-0 w-12 h-12 animate-spin text-blue-600" />
      </div>
      <div className="text-center">
        <p className="text-gray-800 font-medium">Processing image...</p>
        <p className="text-gray-500 text-sm">This may take a few moments</p>
      </div>
    </div>
  </div>
);

export default LoadingOverlay;