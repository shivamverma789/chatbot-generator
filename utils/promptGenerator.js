// utils/promptGenerator.js

function generateSystemPrompt(bot) {
  let prompt = `You are a ${bot.tone} AI assistant. `;

  if (bot.abilities) {
    prompt += `You have special abilities such as: ${bot.abilities}. `;
  }

  if (bot.goal) {
    prompt += `Your primary goal is: ${bot.goal}. `;
  } else {
    prompt += `Your goal is to assist users effectively. `;
  }

  prompt += `Respond accurately and helpfully in all interactions.`;

  return prompt;
}

module.exports = generateSystemPrompt;
