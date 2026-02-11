
import { GoogleGenAI, Type } from "@google/genai";
import { AddOn } from "../types";

/**
 * Generates a luxury itinerary JSON for the guest.
 */
export const generateItinerary = async (selectedAddOns: AddOn[], name: string = "Guest", stayDuration: number) => {
  // Initialize GoogleGenAI inside the function to use the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-pro-preview';
  const addOnsList = selectedAddOns.map(a => `${a.title}`).join(", ");

  const prompt = `
    Create a personalized ${stayDuration}-day boutique retreat itinerary for ${name} at "AquaJudo Cabo".
    
    Context:
    - This is a FOUNDATIONAL INTRODUCTION to Judo. Focus on balance, safe falling (Ukemi), and simple movements.
    - Absolutely no mention of "Olympic level", "elite competition", or "high-performance".
    - The vibe is "Quiet Luxury"—minimalist, grounded, and restorative. Avoid any exaggeration.
    
    Daily Requirements:
    - Sunrise: Foundational Judo principles (beginner level).
    - Mid-Morning: Restorative coastal stretching or quiet reflection.
    - Afternoon: Integrate these specific expeditions: ${addOnsList}
    
    Format as a structured JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            intro: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.NUMBER },
                  dailyRoutine: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["time", "title", "description"]
                    }
                  }
                },
                required: ["dayNumber", "activities", "dailyRoutine"]
              }
            },
            conclusion: { type: Type.STRING }
          },
          required: ["title", "intro", "days", "conclusion"]
        }
      }
    });

    // Access the .text property directly (not a method)
    const text = response.text;
    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("Itinerary Error:", error);
    return null;
  }
};
