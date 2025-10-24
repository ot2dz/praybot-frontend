import React, { useState, useEffect } from 'react';
import { AIProvider, validateAPIKey, getAIProviderName, getAIProviderDescription } from '../services/aiServiceFactory';

interface ApiKeyInputProps {
  provider: AIProvider;
  onApiKeyChange: (apiKey: string, isValid: boolean) => void;
  initialApiKey?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ provider, onApiKeyChange, initialApiKey = '' }) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [isVisible, setIsVisible] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; message?: string }>({ isValid: true });

  useEffect(() => {
    setApiKey(initialApiKey);
  }, [initialApiKey]);

  useEffect(() => {
    if (apiKey.trim()) {
      const validationResult = validateAPIKey(provider, apiKey);
      setValidation(validationResult);
      onApiKeyChange(apiKey, validationResult.isValid);
    } else {
      setValidation({ isValid: false, message: 'API key is required' });
      onApiKeyChange('', false);
    }
  }, [apiKey, provider, onApiKeyChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const getProviderIcon = (provider: AIProvider): string => {
    switch (provider) {
      case 'gemini':
        return '🤖';
      case 'openai':
        return '🧠';
      default:
        return '🔑';
    }
  };

  const getProviderInstructions = (provider: AIProvider): string => {
    switch (provider) {
      case 'gemini':
        return 'Get your API key from Google AI Studio (makersuite.google.com/app/apikey)';
      case 'openai':
        return 'Get your API key from OpenAI Platform (platform.openai.com/api-keys)';
      default:
        return 'Enter your API key';
    }
  };

  const getKeyFormat = (provider: AIProvider): string => {
    switch (provider) {
      case 'gemini':
        return 'AIza...';
      case 'openai':
        return 'sk-...';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{getProviderIcon(provider)}</span>
        <div>
          <h3 className="font-semibold text-gray-800">{getAIProviderName(provider)} API Key</h3>
          <p className="text-sm text-gray-600">{getAIProviderDescription(provider)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type={isVisible ? 'text' : 'password'}
            value={apiKey}
            onChange={handleChange}
            placeholder={`Enter your ${getAIProviderName(provider)} API key (${getKeyFormat(provider)})`}
            className={`w-full px-4 py-3 pr-12 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 transition-colors ${
              apiKey.trim() === ''
                ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                : validation.isValid
                ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                : 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
            }`}
            dir="ltr"
          />
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={isVisible ? 'Hide API key' : 'Show API key'}
          >
            {isVisible ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Validation message */}
        {apiKey.trim() !== '' && !validation.isValid && validation.message && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <span>⚠️</span>
            <span>{validation.message}</span>
          </div>
        )}

        {/* Success message */}
        {apiKey.trim() !== '' && validation.isValid && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <span>✅</span>
            <span>API key format is valid</span>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            <span className="font-medium">📋 How to get your API key:</span><br />
            {getProviderInstructions(provider)}
          </p>
        </div>

        {/* Security note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            <span className="font-medium">🔒 Security Note:</span> Your API key is only stored temporarily in your browser and is not saved anywhere. You'll need to re-enter it each time you visit this page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;