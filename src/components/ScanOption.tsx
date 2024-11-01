import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ScanOptionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

const ScanOption: React.FC<ScanOptionProps> = ({ icon: Icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left border border-gray-100 hover:border-blue-200 hover:from-blue-50 hover:to-blue-100 group"
  >
    <div className="flex items-start space-x-4">
      <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-blue-600 transition-colors duration-200">
        <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-200" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
    </div>
  </button>
);

export default ScanOption;