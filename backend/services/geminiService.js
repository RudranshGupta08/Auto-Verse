import OpenAI from "openai";

export async function detectIntent(message) {

  console.log(
    "KEY EXISTS:",
    !!process.env.OPENAI_API_KEY
  );

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response =
    await openai.chat.completions.create({

      model: "gpt-4o-mini",

      response_format: {
        type: "json_object"
      },

      messages: [
        {
          role: "system",
          content: `
You are an automotive intent detector.

Return JSON only.

Example:

"SUV under 20 lakh"

{
 "intent":"recommendation",
 "bodyType":"SUV",
 "budget":2000000
}
`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

  return JSON.parse(
    response.choices[0].message.content
  );
}