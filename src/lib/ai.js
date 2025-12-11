// lib/gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



const model = genAI.getGenerativeModel({

  model: "gemini-2.5-flash",

  generationConfig: {

    responseMimeType: "application/json",

    temperature: 0.2,

  },

  systemInstruction: `

You are an IoT + AI Safety Engine.



Your job is to analyze multi-sensor input from Arduino and classify the environment as:

- "SAFE"

- "DANGER"



## INPUT FORMAT

{

  "temp": number,

  "humidity": number,

  "ir": number,

  "ax": number,

  "ay": number,

  "az": number

}



## OUTPUT FORMAT (STRICT JSON)

{

  "status": "SAFE" | "DANGER",

  "reason": "string",

  "thresholdPassed": Boolean,

  "triggeredSensor": "temp" | "humidity" | "ir" | "motion" | null

}



## RULES

- Respond ONLY in valid JSON.



### DATA-DRIVEN THRESHOLDS (derived from actual dataset)

- Temperature danger: temp >= 30

- Humidity danger: humidity >= 62

- IR danger: ir == 1 (object detected)

- Motion danger:

    |ax| >= 2 OR |ay| >= 2 OR |az| >= 2



### CLASSIFICATION LOGIC

- If ANY sensor crosses its threshold → DANGER.

- If none cross → SAFE.

- "reason" must be short.

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