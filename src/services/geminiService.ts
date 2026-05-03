import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getPersonalizedRecommendations(department: string, successScore: number) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined in the environment.");
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Sen EduBox eğitim koçusun. Öğrencinin bölümü ${department} ve başarı skoru ${successScore}. 
      Bu öğrenciye özel 3 adet kısa tavsiye ver:
      1. Bölümüne özel bir teknik tavsiye.
      2. Başarı skoruna göre bir motivasyon cümlesi.
      3. Kariyer gelişimi için bir adım.
      
      Yanıtı şu formatta ver:
      TIP1: [tavsiye]
      TIP2: [motivasyon]
      TIP3: [kariyer]
      Her biri tek cümle olsun.`,
    });
    
    const text = response.text || "";
    const tips = text.split('\n')
      .filter(line => line.includes('TIP'))
      .map(line => line.split(': ')[1]?.trim())
      .filter(Boolean);

    return tips.length >= 3 ? tips : [
      "Bölümünle ilgili güncel makaleleri takip et.",
      "Başarı basamaklarını emin adımlarla tırmanıyorsun!",
      "Networking etkinliklerine katılarak vizyonunu genişlet."
    ];
  } catch (error) {
    console.error("Gemini error", error);
    return [
      "Bölümünle ilgili güncel makaleleri takip et.",
      "Başarı basamaklarını emin adımlarla tırmanıyorsun!",
      "Networking etkinliklerine katılarak vizyonunu genişlet."
    ];
  }
}

export async function getStudyTip(department: string, successScore: number) {
  const tips = await getPersonalizedRecommendations(department, successScore);
  return tips[0];
}
