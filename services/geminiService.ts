
// @ts-ignore
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = "AIzaSyCLCEENNhHMLzBWuqWy5ZqFHbB_pFDPTBA";

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// Utility to convert File to a Gemini-compatible part
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const generateContentStream = async (prompt: string, image?: File | null, systemInstruction?: string) => {
  try {
    const config = systemInstruction ? { systemInstruction } : undefined;

    if (!image) {
      return await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents: prompt,
        config,
      });
    }

    const imagePart = await fileToGenerativePart(image);
    const textPart = { text: prompt };
    
    return await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: { parts: [imagePart, textPart] },
      config,
    });
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content from Gemini API.");
  }
};

export const generateContent = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content from Gemini API.");
  }
};