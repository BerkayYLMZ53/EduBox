import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getStudyTip(department: string, successScore: number) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sen EduBox asistanısın. Öğrencinin bölümü ${department} ve başarı skoru ${successScore}. Bu öğrenciye kısa, motive edici ve akademik bir çalışma ipucu ver. Tek bir cümle olsun.`,
    });
    return response.text || "Bugün harika bir gün, çalışmaya devam et!";
  } catch (error) {
    console.error("Gemini error", error);
    return "Bugün harika bir gün, çalışmaya devam et!";
  }
}
