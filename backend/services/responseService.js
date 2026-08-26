import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function generateResponse(
  userMessage,
  databaseResult
) {

  const response =
  await ai.models.generateContent({

    model: "gemini-2.5-flash",

    contents: `
You are AutoVerse AI,
an expert automotive consultant.

User Question:
${userMessage}

Database Result:
${JSON.stringify(databaseResult)}

Rules:

- Use database information first.
- Do not invent specifications.
- Be conversational.
- Recommend cars when appropriate.
- Explain pros and cons.
- Mention missing information honestly.
`
  });

  return response.text;
}