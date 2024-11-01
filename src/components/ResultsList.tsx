import React from 'react';
import { FoodItem } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface ResultsListProps {
  results: FoodItem[];
}

const ResultsList: React.FC<ResultsListProps> = ({ results }) => {
  if (results.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center space-x-2 mb-6">
        <CheckCircle2 className="text-green-500" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Detected Items</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {results.map((item, index) => (
          <div
            key={index}
            className="py-4 flex justify-between items-center"
          >
            <span className="font-medium text-gray-800">{item.name}</span>
            <span className="text-gray-600">
              {item.quantity} {item.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsList;