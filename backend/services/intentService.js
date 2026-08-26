import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function detectIntent(message) {
  const prompt = `
You are AutoVerse Intent Engine.

Return ONLY valid JSON.
Do NOT use Markdown.
Do NOT use code fences.
Do NOT write \`\`\`json.
Return the JSON object directly.

Possible intents:

1. recommendation
2. details
3. comparison
4. general

Examples:

User: Suggest SUV under 20 lakh

{
  "intent": "recommendation",
  "bodyType": "SUV",
  "budget": 2000000
}

User: Tell me about Brezza

{
  "intent": "details",
  "car": "Brezza"
}

User: Brezza vs Harrier

{
  "intent": "comparison",
  "cars": ["Brezza", "Harrier"]
}

User: What is ADAS?

{
  "intent": "general"
}

User:
${message}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  let text = response.text.trim();

  // Remove Markdown code fences if Gemini returns them
  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("❌ Intent JSON Parse Error:");
    console.error("Gemini Response:", text);

    throw new Error(
      "Gemini returned an invalid intent response."
    );
  }
}