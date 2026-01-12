
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDescription = async (cakeName: string, category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, luxurious, and mouth-watering description (max 2 sentences) for a bakery cake named "${cakeName}" in the category "${category}". Make it sound professional and inviting.`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    return response.text?.trim() || "Delicious freshly baked cake by Farah.";
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return "Handcrafted with the finest ingredients and love.";
  }
};
