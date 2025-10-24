import type { PrayerTime } from '../types';

export const extractPrayerTimesWithOpenAI = async (imageFile: File, apiKey: string): Promise<PrayerTime[]> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const base64Image = await fileToBase64(imageFile);

  const prompt = `You are an expert OCR and data extraction agent specializing in Arabic prayer timetables from Algeria.
Your task is to extract the entire prayer schedule from the provided image.

Follow these steps carefully:
1. **Identify the Year and Month(s)**: First, locate the Gregorian year and month(s) from the text in the image header. The header will specify the year and the corresponding Gregorian months (e.g., "أوت / سبتمبر 2025 م" means August / September 2025).
2. **Process Each Row**: For each row in the timetable:
   a. **Extract the Day**: Read the day number from the Gregorian date column (e.g., the column under "أوت / سبتمبر").
   b. **Construct the Full Date**: Combine the year, the correct month, and the extracted day to form a complete Gregorian date in \`YYYY-MM-DD\` format. It is crucial that you correctly handle the month transition. When the day number resets to '01', you must switch to the next month (e.g., from August to September). For example, if the year is 2025, and the days go from 31 to 01, the dates should be '2025-08-31' followed by '2025-09-01'.
   c. **Extract Prayer Times**: Extract the times for Fajr (الفجر), Dhuhr (الظهر), Asr (العصر), Maghrib (المغرب), and Isha (العشاء).
3. **Normalize Data**:
   - Convert all Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) to Western numerals (0123456789).
   - Ensure all prayer times are in \`HH:mm\` format.
4. **Format Output**: Return the extracted data as a valid JSON array. Each object should have these exact keys: "date", "fajr", "dhuhr", "asr", "maghrib", "isha". Ensure you extract all rows present in the timetable.

Return ONLY the JSON array, no additional text or formatting.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using GPT-4 Omni which supports vision
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                  detail: 'high'
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for consistent extraction
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}. ${
          errorData.error?.message || 'Unknown error'
        }`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from OpenAI API');
    }

    // Clean the response - remove any markdown formatting
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();

    try {
      const parsedData = JSON.parse(cleanedContent);
      
      // Validate the structure
      if (!Array.isArray(parsedData)) {
        throw new Error('OpenAI returned data in an unexpected format (not an array)');
      }

      if (parsedData.length === 0) {
        throw new Error('OpenAI could not extract any prayer times from the image');
      }

      // Validate each object has required fields
      const requiredFields = ['date', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      for (const item of parsedData) {
        if (typeof item !== 'object' || !item) {
          throw new Error('Invalid prayer time object in response');
        }
        for (const field of requiredFields) {
          if (!(field in item)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
      }

      return parsedData as PrayerTime[];
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', cleanedContent);
      throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while processing with OpenAI');
  }
};