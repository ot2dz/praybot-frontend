
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  'Analyzing image layout...',
  'Identifying table structure...',
  'Extracting prayer times with OCR...',
  'Normalizing numbers and dates...',
  'Building your editable schedule...',
  'Finalizing data...'
];

interface LoaderProps {
  imagePreview: string | null;
}

const Loader: React.FC<LoaderProps> = ({ imagePreview }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 flex flex-col md:flex-row items-center justify-center gap-8">
      {imagePreview && (
        <div className="w-full md:w-1/3 flex-shrink-0">
          <img src={imagePreview} alt="Processing timetable" className="rounded-lg shadow-md animate-pulse"/>
        </div>
      )}
      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold text-slate-800">Processing...</h2>
        </div>
        <p className="text-lg text-slate-500 transition-opacity duration-500">
          {loadingMessages[messageIndex]}
        </p>
        <p className="text-sm text-slate-500/80 mt-2">
          Please wait a moment while the AI works its magic.
        </p>
      </div>
    </div>
  );
};

export default Loader;
