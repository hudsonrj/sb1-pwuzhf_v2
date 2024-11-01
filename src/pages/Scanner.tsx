import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, ImagePlus, ScanLine, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeImage, ApiError } from '../lib/api';
import { FoodItem } from '../types';
import ScanOption from '../components/ScanOption';
import CameraCapture from '../components/CameraCapture';
import ResultsList from '../components/ResultsList';
import LoadingOverlay from '../components/LoadingOverlay';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const Scanner: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [results, setResults] = useState<FoodItem[]>([]);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image file is too large. Please select an image under 10MB');
      return false;
    }

    return true;
  };

  const processImage = async (imageData: string | File) => {
    setIsProcessing(true);
    try {
      let file: File;
      
      if (typeof imageData === 'string') {
        const response = await fetch(imageData);
        if (!response.ok) {
          throw new Error('Failed to process camera image');
        }
        const blob = await response.blob();
        file = new File([blob], 'webcam-image.jpg', { type: 'image/jpeg' });
      } else {
        file = imageData;
      }

      if (!validateFile(file)) {
        return;
      }

      const result = await analyzeImage(file);
      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
      
      if (!Array.isArray(parsedResult)) {
        throw new Error('Invalid response format');
      }
      
      setResults(parsedResult);
      
      if (parsedResult.length === 0) {
        toast.warning('No food items were detected in the image');
      } else {
        toast.success(`Successfully detected ${parsedResult.length} item${parsedResult.length === 1 ? '' : 's'}!`);
      }
    } catch (error) {
      let message = 'Failed to process image';
      let details = '';

      if (error instanceof ApiError) {
        message = error.message;
        details = error.details || '';
      } else if (error instanceof Error) {
        message = error.message;
      }

      console.error('Image processing error:', {
        message,
        details,
        error
      });

      toast.error(details ? `${message}: ${details}` : message);
      setResults([]);
    } finally {
      setIsProcessing(false);
      if (showCamera) {
        setShowCamera(false);
      }
    }
  };

  const handleCapture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      processImage(imageSrc);
    } else {
      toast.error('Failed to capture image from camera');
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Food Scanner</h1>
            <p className="text-blue-100 text-lg">
              Easily track your food inventory by scanning receipts
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-full">
            <ScanLine className="w-12 h-12" />
          </div>
        </div>
        
        <div className="flex items-center space-x-3 text-sm">
          <Sparkles className="w-5 h-5" />
          <p className="text-blue-100">
            Powered by AI to automatically detect food items and quantities
          </p>
        </div>
      </div>

      {/* Scan Options */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Choose a scanning method
        </h2>

        {!showCamera ? (
          <div className="grid md:grid-cols-2 gap-6">
            <ScanOption
              icon={Camera}
              title="Take Photo"
              description="Use your camera to scan a receipt"
              onClick={() => setShowCamera(true)}
            />

            <ScanOption
              icon={ImagePlus}
              title="Upload Image"
              description="Select a receipt from your device"
              onClick={() => fileInputRef.current?.click()}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        ) : (
          <CameraCapture
            webcamRef={webcamRef}
            onCapture={handleCapture}
            onCancel={() => setShowCamera(false)}
          />
        )}
      </div>

      {/* Results Section */}
      <ResultsList results={results} />

      {isProcessing && <LoadingOverlay />}
    </div>
  );
};

export default Scanner;