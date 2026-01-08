
import { GoogleGenAI, Type } from "@google/genai";
import { GrowthLog, FamilyMember, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHealthInsights = async (member: FamilyMember, lang: Language, growthLogs?: GrowthLog[]) => {
  try {
    const model = 'gemini-3-flash-preview';
    const targetLang = lang === 'ID' ? 'Indonesian' : 'English';
    
    const prompt = `
      You are a specialized medical AI assistant.
      Based on the following profile, provide actionable health insights.
      
      CRITICAL: You MUST return all content in ${targetLang}.
      
      Profile:
      Name: ${member.name}
      Age: ${new Date().getFullYear() - new Date(member.birthDate).getFullYear()} years old
      Role: ${member.relation}
      Allergies: ${member.allergies.map(a => `${a.name} (${a.reaction})`).join(', ') || 'None'}
      
      Return JSON:
      {
        "insights": [
          {
            "title": "string",
            "content": "string",
            "source": "AI" | "WHO" | "IDAI",
            "type": "info" | "warning" | "success"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  source: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["title", "content", "source", "type"]
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{"insights":[]}');
    return result.insights;
  } catch (error) {
    console.error("Error fetching insights:", error);
    return [];
  }
};

export const fetchLatestIdaiSchedule = async (childAgeMonths: number, lang: Language) => {
  try {
    const targetLang = lang === 'ID' ? 'Indonesian' : 'English';
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide the OFFICIAL IDAI (Ikatan Dokter Anak Indonesia) LATEST 2024/2025 immunization schedule for a child aged ${childAgeMonths} months. 
      Focus on the most recent 2024 updates.
      Format the output in clean Markdown with clear sections. 
      Use bold headers for: 'JADWAL WAJIB SAAT INI', 'JADWAL MENDATANG', and 'TIP KESEHATAN'.
      Output language: ${targetLang}.`,
      config: {
        systemInstruction: "You are a pediatric health expert. Always use the latest official IDAI 2024/2025 data."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching IDAI schedule:", error);
    return "Gagal mengambil jadwal terbaru.";
  }
};

export const analyzeMedicalRecord = async (content: string, lang: Language) => {
  try {
    const targetLang = lang === 'ID' ? 'Indonesian' : 'English';
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this medical record: "${content}". 
      Provide a highly structured analysis with 3 distinct cards: 
      1. 🔍 Temuan Utama (Key Findings)
      2. 📋 Ringkasan Diagnosis (Diagnostic Summary)
      3. ✅ Tindakan Selanjutnya (Action Items)
      
      Keep it professional, tidy, and clean. 
      Output language: ${targetLang}.`,
      config: {
        systemInstruction: "You are a senior medical consultant. Structure your response into clear, distinct sections for easy reading."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing record:", error);
    return "Analisa gagal.";
  }
};
