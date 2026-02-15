
import { GoogleGenAI } from "@google/genai";

export const getDragonCommentary = async (score: number, missed: number): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a grumpy but lovable bearded dragon. I just played a game where I caught ${score} crickets and missed ${missed}. Give me a short (1 sentence), funny, Australian-accented comment on my performance. Mention my hunger.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    return response.text || "Stone the crows! I'm still starvin' mate. Fetch more crickets!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Strewth! My belly is still rumblin'. Catch 'em better next time!";
  }
};
