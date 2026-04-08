const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const { buildRagUserPrompt } = require('./promptBuilder.service');

function getModel() {
  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  return genAI.getGenerativeModel({ model: config.gemini.model });
}

/**
 * @param {string} systemInstruction
 * @param {string} userText
 * @returns {Promise<string>}
 */
async function generateWithSystemInstruction(systemInstruction, userText) {
  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  const model = genAI.getGenerativeModel({
    model: config.gemini.model,
    systemInstruction,
  });
  const result = await model.generateContent(userText);
  return result.response.text();
}

const SYSTEM_PREAMBLE = `You answer using the document excerpts as the primary source of facts.
If the answer is not supported by the excerpts, say so clearly — do not invent details.
When prior conversation is provided, use it only to interpret short or ambiguous follow-up questions.`;

/**
 * @param {string} question
 * @param {string} context - retrieved RAG text
 * @param {import('./conversationMemory.service').ChatTurn[]} [priorTurns]
 */
async function answerFromContext(question, context, priorTurns = []) {
  const userPart = buildRagUserPrompt({ question, context, priorTurns });
  const prompt = `${SYSTEM_PREAMBLE}\n\n${userPart}`;

  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = {
  answerFromContext,
  generateWithSystemInstruction,
  SYSTEM_PREAMBLE,
};
