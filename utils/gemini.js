const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getGeminiReply(bot, userMessage) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [userMessage],
      config: {
        systemInstruction: bot.systemPrompt,
        maxOutputTokens: 256,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from Gemini API");
  }
}

async function generateBotDescription(bot) {
  const prompt = `
  Write a concise and engaging 50-word description for a chatbot with the following attributes:
  Name: ${bot.name}
  Type: ${bot.type}
  Tone: ${bot.tone}
  Abilities: ${bot.abilities}
  Goal: ${bot.goal || 'Not specified'}.
  Focus on what the bot does and its use case.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [prompt.trim()],
      config: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return "Description could not be generated.";
  }
}


module.exports = { getGeminiReply , generateBotDescription };
