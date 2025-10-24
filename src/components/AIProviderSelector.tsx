import React from 'react';
import { AIProvider, getAIProviderName, getAIProviderDescription } from '../services/aiServiceFactory';
import ApiKeyInput from './ApiKeyInput';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  apiKey: string;
  onApiKeyChange: (apiKey: string, isValid: boolean) => void;
  isApiKeyValid: boolean;
}

const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  apiKey,
  onApiKeyChange,
  isApiKeyValid
}) => {
  const providers: { id: AIProvider; name: string; description: string; icon: string; color: string }[] = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Google\'s advanced AI with excellent vision capabilities',
      icon: '🤖',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      description: 'OpenAI\'s GPT-4 with vision for accurate extraction',
      icon: '🧠',
      color: 'from-green-500 to-teal-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Select AI Provider
        </h2>
        <p className="text-slate-500">
          Choose which AI service to use for extracting prayer times from images
        </p>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {providers.map((provider) => (
          <div
            key={provider.id}
            onClick={() => onProviderChange(provider.id)}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedProvider === provider.id
                ? 'border-blue-600 bg-blue-600/5'
                : 'border-gray-200 hover:border-blue-600/50'
            }`}
          >
            {/* Selection indicator */}
            {selectedProvider === provider.id && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${provider.color} flex items-center justify-center text-2xl`}>
                {provider.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  selectedProvider === provider.id ? 'text-blue-600' : 'text-slate-800'
                }`}>
                  {provider.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {provider.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API Key Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          API Configuration for {getAIProviderName(selectedProvider)}
        </h3>
        
        <ApiKeyInput
          provider={selectedProvider}
          onApiKeyChange={onApiKeyChange}
          initialApiKey={apiKey}
        />

        {/* Status indicator */}
        <div className={`p-4 rounded-lg border ${
          apiKey.trim() === ''
            ? 'border-yellow-200 bg-yellow-50'
            : isApiKeyValid
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {apiKey.trim() === '' ? '⏳' : isApiKeyValid ? '✅' : '❌'}
            </span>
            <span className={`font-medium ${
              apiKey.trim() === ''
                ? 'text-yellow-800'
                : isApiKeyValid
                ? 'text-green-800'
                : 'text-red-800'
            }`}>
              {apiKey.trim() === ''
                ? 'API key required to proceed'
                : isApiKeyValid
                ? 'Ready to process images!'
                : 'Please check your API key'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProviderSelector;