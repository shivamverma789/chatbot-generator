const { chat } = require('@google/genai'); // or your actual Gemini client setup

async function generateDescription(bot) {
  const prompt = `Write a concise 50-word description summarizing the following chatbot:
Name: ${bot.name}
Type: ${bot.type}
Tone: ${bot.tone}
Abilities: ${bot.abilities}
Goal: ${bot.goal || "No specific goal"}.
The description should capture the essence of the bot.`;

  try {
    const response = await chat({
      model: 'gemini-2.0-flash', 
      temperature: 0.7,
      candidateCount: 1,
      prompt: [{ author: 'user', content: prompt }],
    });

    return response?.candidates[0]?.content.trim() || "No description available.";
  } catch (error) {
    console.error("Failed to generate description:", error);
    return "No description available due to an error.";
  }
}

module.exports = { generateDescription };
