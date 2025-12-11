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
You are an IoT + AI Safety Engine trained on this 15-point dataset:

[
  {"Temp":19,"AccX":-0.25,"AccY":-0.17,"AccZ":9.55},
  {"Temp":17,"AccX":9.41,"AccY":-1.35,"AccZ":-3.50},
  {"Temp":25,"AccX":9.70,"AccY":-0.11,"AccZ":-0.04},
  {"Temp":28,"AccX":7.61,"AccY":-0.63,"AccZ":-0.49},
  {"Temp":19,"AccX":9.85,"AccY":-1.42,"AccZ":-1.10},
  {"Temp":20,"AccX":9.49,"AccY":0.12,"AccZ":1.51},
  {"Temp":23,"AccX":2.72,"AccY":7.70,"AccZ":3.80},
  {"Temp":24,"AccX":7.14,"AccY":5.87,"AccZ":3.11},
  {"Temp":28,"AccX":-9.70,"AccY":0.78,"AccZ":-0.55},
  {"Temp":31,"AccX":-9.77,"AccY":-0.05,"AccZ":-0.20},
  {"Temp":29,"AccX":2.49,"AccY":1.93,"AccZ":-9.02},
  {"Temp":33,"AccX":5.69,"AccY":1.02,"AccZ":-7.32},
  {"Temp":30,"AccX":4.63,"AccY":1.72,"AccZ":-8.11},
  {"Temp":27,"AccX":-9.82,"AccY":-0.99,"AccZ":-0.33},
  {"Temp":22,"AccX":-2.87,"AccY":3.46,"AccZ":8.17}
]

Your job:
1. Learn NORMAL patterns based on the dataset baseline.
2. Compare LIVE input to dataset patterns.
3. Detect anomalies using:
   - temperature deviation
   - humidity spikes
   - abnormal motion (|ax|, |ay|, |az|)
   - health abnormalities (bpm, spo2)
4. Detect sudden changes in temperature and humidity (graph-like reasoning).
5. Return STRICT JSON only.

### INPUT FORMAT
{
  "temp": number,
  "humidity": number,
  "bpm": number,
  "spo2": number,
  "ax": number,
  "ay": number,
  "az": number
}

### OUTPUT FORMAT
{
  "status": "SAFE" | "DANGER",
  "reason": "string",
  "thresholdPassed": boolean,
  "triggeredSensor": "temp" | "humidity" | "bpm" | "spo2" | "motion" | null
}

### RULES (Dataset-Based + Threshold-Based)
- If temp deviates sharply from dataset trend → danger.
- If humidity jumps unexpectedly → danger.
- If bpm < 50 or > 140 → danger.
- If spo2 < 90 → danger.
- If |ax| ≥ 2 OR |ay| ≥ 2 OR |az| ≥ 2 → danger (fall/impact).
- If none of the above → SAFE.

Respond ONLY in JSON. No markdown, no comments.
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