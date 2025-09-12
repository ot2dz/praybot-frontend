
import React, { useState, useCallback } from 'react';
import { PrayerTime } from './types';
import { extractPrayerTimes } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import PrayerTable from './components/PrayerTable';
import { ErrorIcon, ResetIcon } from './components/Icons';

type AppState = 'idle' | 'processing' | 'success' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [prayerData, setPrayerData] = useState<PrayerTime[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleImageUpload = async (file: File) => {
    setAppState('processing');
    setErrorMessage('');
    setImagePreview(URL.createObjectURL(file));

    try {
      const data = await extractPrayerTimes(file);
      if (data && data.length > 0) {
        setPrayerData(data);
        setAppState('success');
      } else {
        throw new Error('The AI could not extract any data. Please try another image or check if the image is clear.');
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(`Failed to process image. ${message}`);
      setAppState('error');
    }
  };

  const handleDataChange = useCallback((updatedData: PrayerTime[]) => {
    setPrayerData(updatedData);
  }, []);

  const handleReset = () => {
    setAppState('idle');
    setPrayerData([]);
    setImagePreview(null);
    setErrorMessage('');
  };

  const renderContent = () => {
    switch (appState) {
      case 'processing':
        return <Loader imagePreview={imagePreview} />;
      case 'success':
        return (
          <PrayerTable 
            initialData={prayerData} 
            onDataChange={handleDataChange} 
            imagePreview={imagePreview}
          />
        );
      case 'error':
        return (
          <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-red-200">
            <ErrorIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-dark mb-2">Processing Failed</h3>
            <p className="text-neutral-medium max-w-md mx-auto">{errorMessage}</p>
          </div>
        );
      case 'idle':
      default:
        return <ImageUploader onImageUpload={handleImageUpload} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light font-sans text-neutral-dark flex flex-col items-center">
      <Header />
      <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        <div className="relative">
          {appState !== 'idle' && (
             <button
                onClick={handleReset}
                className="absolute -top-2 right-0 z-20 flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 font-semibold py-2 px-4 border border-red-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105"
                aria-label="Start over"
              >
                <ResetIcon className="w-5 h-5" />
                Start Over
              </button>
          )}
          {renderContent()}
        </div>
      </main>
      <footer className="w-full text-center p-4 text-neutral-medium text-sm">
        <p>&copy; {new Date().getFullYear()} Prayer Timetable Extractor. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
