
import { GoogleGenAI, Type } from "@google/genai";
import type { PrayerTime } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const PRAYER_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      date: {
        type: Type.STRING,
        description: "The Gregorian date for the prayer times, formatted as YYYY-MM-DD."
      },
      fajr: {
        type: Type.STRING,
        description: "The time for Fajr prayer in HH:mm format."
      },
      dhuhr: {
        type: Type.STRING,
        description: "The time for Dhuhr prayer in HH:mm format."
      },
      asr: {
        type: Type.STRING,
        description: "The time for Asr prayer in HH:mm format."
      },
      maghrib: {
        type: Type.STRING,
        description: "The time for Maghrib prayer in HH:mm format."
      },
      isha: {
        type: Type.STRING,
        description: "The time for Isha prayer in HH:mm format."
      }
    },
    required: ["date", "fajr", "dhuhr", "asr", "maghrib", "isha"]
  }
};

export const extractPrayerTimes = async (imageFile: File): Promise<PrayerTime[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `You are an expert OCR and data extraction agent specializing in Arabic prayer timetables from Algeria.
Your task is to extract the entire prayer schedule from the provided image.

Follow these steps carefully:
1.  **Identify the Year and Month(s)**: First, locate the Gregorian year and month(s) from the text in the image header. The header will specify the year and the corresponding Gregorian months (e.g., "أوت / سبتمبر 2025 م" means August / September 2025).
2.  **Process Each Row**: For each row in the timetable:
    a. **Extract the Day**: Read the day number from the Gregorian date column (e.g., the column under "أوت / سبتمبر").
    b. **Construct the Full Date**: Combine the year, the correct month, and the extracted day to form a complete Gregorian date in \`YYYY-MM-DD\` format. It is crucial that you correctly handle the month transition. When the day number resets to '01', you must switch to the next month (e.g., from August to September). For example, if the year is 2025, and the days go from 31 to 01, the dates should be '2025-08-31' followed by '2025-09-01'.
    c. **Extract Prayer Times**: Extract the times for Fajr (الفجر), Dhuhr (الظهر), Asr (العصر), Maghrib (المغرب), and Isha (العشاء).
3.  **Normalize Data**:
    - Convert all Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) to Western numerals (0123456789).
    - Ensure all prayer times are in \`HH:mm\` format.
4.  **Format Output**: Return the extracted data as a valid JSON array matching the provided schema. Ensure you extract all rows present in the timetable.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
        responseMimeType: 'application/json',
        responseSchema: PRAYER_SCHEMA
    }
  });
  
  const jsonText = response.text.trim();
  
  try {
    const parsedData = JSON.parse(jsonText);
    if (!Array.isArray(parsedData) || (parsedData.length > 0 && typeof parsedData[0] !== 'object')) {
        throw new Error('API returned data in an unexpected format.');
    }
    if(parsedData.length > 0 && !('date' in parsedData[0] && 'fajr' in parsedData[0])) {
         throw new Error('API returned objects with missing keys.');
    }
    return parsedData as PrayerTime[];
  } catch (e) {
    console.error("Failed to parse JSON response:", jsonText);
    throw new Error("The AI returned an invalid data structure. Please try again.");
  }
};
