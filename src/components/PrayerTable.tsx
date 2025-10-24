
import React, { useState, useEffect } from 'react';
import { PrayerTime } from '../types';
import { DownloadIcon, TelegramIcon } from './Icons';

interface PrayerTableProps {
  initialData: PrayerTime[];
  onDataChange: (data: PrayerTime[]) => void;
  imagePreview: string | null;
}

type SendStatus = 'idle' | 'sending' | 'success' | 'error';

const columns: (keyof PrayerTime)[] = ['date', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const columnHeaders: Record<keyof PrayerTime, string> = {
  date: 'Date', fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha'
};

const PrayerTable: React.FC<PrayerTableProps> = ({ initialData, onDataChange, imagePreview }) => {
  const [data, setData] = useState<PrayerTime[]>(initialData);
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  
  // The API URL is read from environment variables.
  // For local development, it will use the value in .env.local (http://localhost:3001)
  // On Coolify, you'll set VITE_API_URL to your backend's public URL.
  // FIX: Use process.env for consistency with other parts of the app and to resolve TypeScript errors.
  const API_BASE_URL = process.env.VITE_API_URL || '';

  useEffect(() => {
    onDataChange(data);
  }, [data, onDataChange]);

  const handleInputChange = (index: number, field: keyof PrayerTime, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    setData(newData);
  };

  const handleDownload = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "prayer-times.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendToBot = async () => {
    if (!API_BASE_URL) {
        alert("API URL is not configured. Please set VITE_API_URL environment variable.");
        return;
    }
    setSendStatus('sending');
    try {
      const response = await fetch(`${API_BASE_URL}/api/update_times`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      setSendStatus('success');
    } catch (error) {
      console.error("Failed to send data to bot:", error);
      setSendStatus('error');
    } finally {
      setTimeout(() => setSendStatus('idle'), 3000); // Reset status after 3 seconds
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {imagePreview && (
          <div className="lg:w-1/3 flex-shrink-0">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center lg:text-left">Uploaded Image</h3>
            <img src={imagePreview} alt="Prayer timetable" className="rounded-lg shadow-md w-full" />
          </div>
        )}
        <div className="flex-grow overflow-x-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Extracted Prayer Times</h2>
            <div className="flex flex-col sm:flex-row gap-3">
               <button
                  onClick={handleSendToBot}
                  disabled={sendStatus === 'sending'}
                  className={`flex items-center justify-center gap-2 w-full sm:w-auto font-semibold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105
                    ${sendStatus === 'sending' ? 'bg-gray-400 cursor-not-allowed' : ''}
                    ${sendStatus === 'idle' ? 'bg-telegram hover:bg-telegram-hover text-white' : ''}
                    ${sendStatus === 'success' ? 'bg-green-500 text-white' : ''}
                    ${sendStatus === 'error' ? 'bg-red-500 text-white' : ''}
                  `}
                >
                  <TelegramIcon className="w-5 h-5" />
                  {sendStatus === 'idle' && 'Send to Telegram Bot'}
                  {sendStatus === 'sending' && 'Sending...'}
                  {sendStatus === 'success' && 'Sent Successfully!'}
                  {sendStatus === 'error' && 'Send Failed!'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Export JSON
                </button>
            </div>
          </div>
          <p className="text-slate-500 mb-4 text-sm sm:text-base">Review and edit the extracted data below. Changes are saved automatically.</p>
          <div className="overflow-x-auto border border-slate-50 rounded-lg">
            <table className="min-w-full divide-y divide-slate-50">
              <thead className="bg-slate-50/50">
                <tr>
                  {columns.map((col) => (
                     <th key={col} scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-slate-800 whitespace-nowrap">{columnHeaders[col]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50/30 transition-colors duration-150">
                    {columns.map((col) => (
                      <td key={col} className="p-0 whitespace-nowrap">
                        <input
                          type="text"
                          value={row[col]}
                          onChange={(e) => handleInputChange(rowIndex, col, e.target.value)}
                          className="w-full px-3 py-2 text-sm text-slate-800 bg-transparent border-none rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                          aria-label={`${columnHeaders[col]} for row ${rowIndex + 1}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTable;