// lib/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.3,
  },
  systemInstruction: `
You are an expert IoT + AI engineer with 10+ years of experience.
Your job is to classify sensor readings as "SAFE" or "DANGER".

## Response Rules:
1. Always respond in **valid JSON** (no markdown, no plain text).
2. JSON must contain:
   - "status": "SAFE" | "DANGER"
   - "reason": string (short explanation)
   - "thresholdPassed": boolean

3. Decision Rules:
   - If sensorValue >= dangerThreshold → status = "DANGER"
   - Else → status = "SAFE"

4. Never return anything outside JSON.
`
});

export const analyzeSensor = async (sensorValue) => {
  try {
    const prompt = `
    {
      "sensorValue": ${sensorValue},
      "dangerThreshold": 70
    }
    `;

    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();

    return JSON.parse(rawText);
  } catch (err) {
    console.error("Gemini error:", err);
    return {
      status: "SAFE",
      reason: "Fallback — model error",
      thresholdPassed: false
    };
  }
};
