import type { PrayerTime } from '../types';
import { extractPrayerTimesWithGemini } from './geminiService';
import { extractPrayerTimesWithOpenAI } from './openaiService';

export type AIProvider = 'gemini' | 'openai';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
}

export const extractPrayerTimesWithAI = async (
  imageFile: File,
  config: AIServiceConfig
): Promise<PrayerTime[]> => {
  switch (config.provider) {
    case 'gemini':
      return extractPrayerTimesWithGemini(imageFile, config.apiKey);
    case 'openai':
      return extractPrayerTimesWithOpenAI(imageFile, config.apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
};

export const getAIProviderName = (provider: AIProvider): string => {
  switch (provider) {
    case 'gemini':
      return 'Google Gemini';
    case 'openai':
      return 'OpenAI GPT-4';
    default:
      return 'Unknown Provider';
  }
};

export const getAIProviderDescription = (provider: AIProvider): string => {
  switch (provider) {
    case 'gemini':
      return 'Google\'s advanced AI model with excellent vision capabilities for text extraction';
    case 'openai':
      return 'OpenAI\'s GPT-4 with vision capabilities for accurate OCR and data extraction';
    default:
      return '';
  }
};

export const validateAPIKey = (provider: AIProvider, apiKey: string): { isValid: boolean; message?: string } => {
  if (!apiKey || apiKey.trim().length === 0) {
    return { isValid: false, message: 'API key is required' };
  }

  switch (provider) {
    case 'gemini':
      if (!apiKey.startsWith('AIza')) {
        return { isValid: false, message: 'Gemini API keys typically start with "AIza"' };
      }
      if (apiKey.length < 30) {
        return { isValid: false, message: 'Gemini API key seems too short' };
      }
      break;
    case 'openai':
      if (!apiKey.startsWith('sk-')) {
        return { isValid: false, message: 'OpenAI API keys start with "sk-"' };
      }
      if (apiKey.length < 40) {
        return { isValid: false, message: 'OpenAI API key seems too short' };
      }
      break;
    default:
      return { isValid: false, message: 'Unknown provider' };
  }

  return { isValid: true };
};