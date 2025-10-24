
import React, { useState, useCallback } from 'react';
import { PrayerTime, InputMethod, AIProvider, AppState } from './types';
import { extractPrayerTimesWithAI } from './services/aiServiceFactory';
import Header from './components/Header';
import InputMethodSelector from './components/InputMethodSelector';
import AIProviderSelector from './components/AIProviderSelector';
import ImageUploader from './components/ImageUploader';
import JsonInput from './components/JsonInput';
import Loader from './components/Loader';
import PrayerTable from './components/PrayerTable';
import { ErrorIcon, ResetIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [inputMethod, setInputMethod] = useState<InputMethod>('image');
  const [aiProvider, setAIProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);
  const [prayerData, setPrayerData] = useState<PrayerTime[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleMethodChange = (method: InputMethod) => {
    setInputMethod(method);
    setAppState('idle');
    setPrayerData([]);
    setImagePreview(null);
    setErrorMessage('');
  };

  const handleProviderChange = (provider: AIProvider) => {
    setAIProvider(provider);
    setApiKey('');
    setIsApiKeyValid(false);
  };

  const handleApiKeyChange = useCallback((newApiKey: string, isValid: boolean) => {
    setApiKey(newApiKey);
    setIsApiKeyValid(isValid);
  }, []);

  const handleImageUpload = async (file: File) => {
    if (!isApiKeyValid) {
      setErrorMessage('Please enter a valid API key first.');
      setAppState('error');
      return;
    }

    setAppState('processing');
    setErrorMessage('');
    setImagePreview(URL.createObjectURL(file));

    try {
      const data = await extractPrayerTimesWithAI(file, { provider: aiProvider, apiKey });
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

  const handleJsonSubmit = (data: PrayerTime[]) => {
    setPrayerData(data);
    setAppState('success');
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

  const canProceedWithImageMethod = () => {
    return inputMethod === 'json' || (inputMethod === 'image' && isApiKeyValid);
  };

  const renderContent = () => {
    // Step 1: Choose input method
    if (appState === 'idle') {
      return <InputMethodSelector selectedMethod={inputMethod} onMethodChange={handleMethodChange} />;
    }

    // Step 2: Configure AI provider (only for image method)
    if (appState === 'configuring' || (inputMethod === 'image' && !canProceedWithImageMethod())) {
      return (
        <AIProviderSelector
          selectedProvider={aiProvider}
          onProviderChange={handleProviderChange}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          isApiKeyValid={isApiKeyValid}
        />
      );
    }

    // Step 3: Processing state
    if (appState === 'processing') {
      return <Loader imagePreview={imagePreview} />;
    }

    // Step 4: Success state
    if (appState === 'success') {
      return (
        <PrayerTable 
          initialData={prayerData} 
          onDataChange={handleDataChange} 
          imagePreview={imagePreview}
        />
      );
    }

    // Step 5: Error state
    if (appState === 'error') {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-red-200">
          <ErrorIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Processing Failed</h3>
          <p className="text-slate-500 max-w-md mx-auto">{errorMessage}</p>
        </div>
      );
    }

    return null;
  };

  const renderActionButtons = () => {
    // Show input components directly for JSON method 
    if (inputMethod === 'json' && appState === 'idle') {
      return (
        <div className="mt-8">
          <JsonInput onJsonSubmit={handleJsonSubmit} />
        </div>
      );
    }

    // Show "Continue" button for image method when ready to configure
    if (inputMethod === 'image' && appState === 'idle') {
      return (
        <div className="mt-6 text-center">
          <button
            onClick={() => setAppState('configuring')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Continue to AI Setup
          </button>
        </div>
      );
    }

    // Show image uploader when AI is configured and ready
    if (inputMethod === 'image' && appState === 'configuring' && canProceedWithImageMethod()) {
      return (
        <div className="mt-8">
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col items-center">
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

          {/* Progress indicator */}
          {appState !== 'idle' && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                <div className={`flex items-center space-x-2 ${
                  appState === 'idle' ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Method</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${
                  (inputMethod === 'image' && (appState === 'configuring' || !canProceedWithImageMethod())) ? 'text-blue-600 font-medium' : 
                  inputMethod === 'json' ? 'text-gray-400' : 'text-gray-400'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    (inputMethod === 'image' && canProceedWithImageMethod()) || inputMethod === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>2</span>
                  <span>{inputMethod === 'image' ? 'AI Setup' : 'Input'}</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center space-x-2 ${
                  appState === 'success' ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    appState === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>3</span>
                  <span>Results</span>
                </div>
              </div>
            </div>
          )}

          {renderContent()}
          {renderActionButtons()}
        </div>
      </main>
      <footer className="w-full text-center p-4 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Prayer Timetable Extractor. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
