// lib/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.1,
  },
  systemInstruction: `
You are an IoT + AI Safety Engine.

IMPORTANT RULE:
- Output ONLY valid JSON.
- NO markdown, NO explanation, NO quotes outside JSON.

Your job:
- Combine ML model output + sensor values
- Return FINAL safety classification

======================
INPUT FORMAT (from backend)
======================
{
  "sensor": {
    "temp": number,
    "humidity": number,
    "ir": number,
    "ax": number,
    "ay": number,
    "az": number
  },
  "ml_prediction": "SAFE" | "DANGER",
  "ml_prob": number
}

======================
STRICT OUTPUT FORMAT
======================
{
  "status": "SAFE" | "DANGER",
  "reason": "string",
  "thresholdPassed": boolean,
  "triggeredSensor": "temp" | "humidity" | "ir" | "motion" | null
}

======================
DECISION RULES
======================

1. ML MODEL ALWAYS HAS PRIORITY:
   - If ml_prediction === "DANGER":
       status = "DANGER"
       thresholdPassed = false
       triggeredSensor = null
       reason = "ML model predicted danger"

2. When ml_prediction === "SAFE":
   Detect EXTREME anomalies:
   - temp >= 65
   - humidity >= 95
   - ir == 1
   - |ax| >= 3 OR |ay| >= 3 OR |az| >= 3

   If ANY anomaly exists:
       status = "DANGER"
       thresholdPassed = true
       triggeredSensor = corresponding sensor
   Otherwise:
       status = "SAFE"
       thresholdPassed = false
       triggeredSensor = null

3. triggeredSensor Rules:
   - temp anomaly       → "temp"
   - humidity anomaly   → "humidity"
   - ir === 1           → "ir"
   - motion anomaly     → "motion"
   - none               → null

4. reason must be SHORT and CLEAR.
`
});

export const analyzeSensor = async (data) => {
  try {
    const prompt = JSON.stringify(data);

    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();

    return JSON.parse(rawText);
  } catch (err) {
    console.error("Gemini error:", err);
    return {
      status: "SAFE",
      reason: "Fallback — model error",
      thresholdPassed: false,
      triggeredSensor: null
    };
  }
};
