import React from 'react';
import { ChefHat } from 'lucide-react';

const Recipes: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ChefHat className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">Recipes</h1>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">Available recipes based on your inventory will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Recipes;