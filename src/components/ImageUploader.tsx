
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload, handleDragEvents]);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 text-center transition-all duration-300">
       <div 
        className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors duration-200 ${isDragging ? 'border-blue-600 bg-brand-light' : 'border-slate-500/50 bg-slate-50'}`}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
        onClick={handleClick}
       >
        <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload timetable image"
        />
        <div className="flex flex-col items-center pointer-events-none">
            <UploadIcon className="w-16 h-16 text-blue-600 mb-4"/>
            <p className="text-xl font-semibold text-slate-800">
                <span className="text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-slate-500 mt-1">PNG, JPG, or WEBP</p>
        </div>
       </div>
       <div className="mt-8 text-left text-slate-500 space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">How it works</h2>
            <ol className="list-decimal list-inside space-y-2 max-w-lg mx-auto">
                <li><span className="font-semibold">Upload Image:</span> Click or drag an image of a prayer timetable onto the area above.</li>
                <li><span className="font-semibold">AI Extraction:</span> Our AI will scan the image, recognize the table, and extract the prayer times.</li>
                <li><span className="font-semibold">Review & Edit:</span> Correct any errors in the extracted data in an easy-to-use table.</li>
                <li><span className="font-semibold">Export Data:</span> Download your finalized prayer schedule as a clean JSON file.</li>
            </ol>
       </div>
    </div>
  );
};

export default ImageUploader;
