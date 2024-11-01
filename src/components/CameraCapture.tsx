import React from 'react';
import Webcam from 'react-webcam';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  webcamRef: React.RefObject<Webcam>;
  onCapture: () => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ webcamRef, onCapture, onCancel }) => (
  <div className="space-y-4">
    <div className="relative">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full rounded-xl shadow-md"
        videoConstraints={{
          facingMode: 'environment'
        }}
      />
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
      >
        <X size={20} />
      </button>
    </div>
    <button
      onClick={onCapture}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl transition-colors flex items-center justify-center space-x-2 font-medium"
    >
      <Camera size={20} />
      <span>Capture Image</span>
    </button>
  </div>
);

export default CameraCapture;