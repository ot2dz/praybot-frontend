
export interface PrayerTime {
  date: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export type AIProvider = 'gemini' | 'openai';

export type InputMethod = 'image' | 'json';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
}

export interface AppConfig {
  inputMethod: InputMethod;
  aiProvider: AIProvider;
  apiKey: string;
}

export type AppState = 'idle' | 'configuring' | 'processing' | 'success' | 'error';
