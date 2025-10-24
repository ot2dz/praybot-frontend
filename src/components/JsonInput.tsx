import React, { useState } from 'react';
import { PrayerTime } from '../types';

interface JsonInputProps {
  onJsonSubmit: (data: PrayerTime[]) => void;
}

const JsonInput: React.FC<JsonInputProps> = ({ onJsonSubmit }) => {
  const [jsonText, setJsonText] = useState('');
  const [validationError, setValidationError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  const exampleJson = [
    {
      "date": "2025-01-01",
      "fajr": "05:30",
      "dhuhr": "12:15",
      "asr": "15:20",
      "maghrib": "17:45",
      "isha": "19:00"
    },
    {
      "date": "2025-01-02",
      "fajr": "05:31",
      "dhuhr": "12:16",
      "asr": "15:21",
      "maghrib": "17:46",
      "isha": "19:01"
    }
  ];

  const validatePrayerTime = (obj: any): obj is PrayerTime => {
    const requiredFields = ['date', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    
    for (const field of requiredFields) {
      if (!(field in obj) || typeof obj[field] !== 'string') {
        return false;
      }
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(obj.date)) {
      return false;
    }
    
    // Validate time format (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const timeFields = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const field of timeFields) {
      if (!timeRegex.test(obj[field])) {
        return false;
      }
    }
    
    return true;
  };

  const validateJson = (data: PrayerTime[]): string | null => {
    if (!Array.isArray(data)) {
      return 'Data must be an array of prayer time objects';
    }
    
    if (data.length === 0) {
      return 'Array cannot be empty';
    }
    
    for (let i = 0; i < data.length; i++) {
      if (!validatePrayerTime(data[i])) {
        return `Invalid prayer time object at index ${i}. Check the format and required fields.`;
      }
    }
    
    return null;
  };

  const handleSubmit = async () => {
    setIsValidating(true);
    setValidationError('');
    
    try {
      if (!jsonText.trim()) {
        throw new Error('Please enter JSON data');
      }
      
      const parsedData = JSON.parse(jsonText);
      const validationError = validateJson(parsedData);
      
      if (validationError) {
        throw new Error(validationError);
      }
      
      onJsonSubmit(parsedData);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setValidationError('Invalid JSON format. Please check your JSON syntax.');
      } else if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError('Unknown error occurred while parsing JSON');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleLoadExample = () => {
    setJsonText(JSON.stringify(exampleJson, null, 2));
    setValidationError('');
  };

  const handleClear = () => {
    setJsonText('');
    setValidationError('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 mb-4">
          <h3 className="text-xl font-bold mb-2">📝 Enter Prayer Times as JSON</h3>
          <p className="text-white/90">
            Paste your prayer times data in JSON format or use the example below
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleLoadExample}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            📄 Load Example
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            disabled={!jsonText.trim()}
          >
            🗑️ Clear
          </button>
        </div>

        <div className="relative">
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setValidationError('');
            }}
            placeholder={`Enter your prayer times JSON here...\n\nExample format:\n${JSON.stringify(exampleJson, null, 2)}`}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            dir="ltr"
          />
        </div>

        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              <p className="text-red-700 font-medium">Validation Error</p>
            </div>
            <p className="text-red-600 mt-1 text-sm">{validationError}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!jsonText.trim() || isValidating}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${
            !jsonText.trim() || isValidating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {isValidating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </span>
          ) : (
            '✅ Process JSON Data'
          )}
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📋 JSON Format Requirements:</h4>
          <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
            <li>Must be an array of prayer time objects</li>
            <li>Each object must have: date, fajr, dhuhr, asr, maghrib, isha</li>
            <li>Date format: YYYY-MM-DD (e.g., "2025-01-01")</li>
            <li>Time format: HH:mm (e.g., "05:30")</li>
            <li>All fields must be strings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JsonInput;