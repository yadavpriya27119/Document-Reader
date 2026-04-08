const {
  trimTurnsToCharBudget,
  formatHistoryBlock,
} = require('./promptBuilder.service');

/**
 * Shared history prefix for agent tasks (follow-ups like "make it shorter").
 * @param {import('./conversationMemory.service').ChatTurn[]} priorTurns
 */
function buildHistoryPrefix(priorTurns) {
  const trimmed = trimTurnsToCharBudget(priorTurns);
  const historyBlock = formatHistoryBlock(trimmed);
  if (!historyBlock) return '';
  return `## Prior conversation\nUse only to resolve pronouns or follow-ups. If unrelated to the current task, ignore.\n\n${historyBlock}\n\n---\n\n`;
}

const SUMMARIZE_SYSTEM = `You are a precise document assistant. Produce a single concise summary paragraph of the material below.
Rules:
- Use only information supported by the document excerpts.
- No bullet lists unless the user explicitly asked for bullets (they did not).
- If excerpts are empty or irrelevant, say you cannot summarize without relevant document content.
- Do not invent facts, numbers, or names not present in the excerpts.`;

const QUIZ_SYSTEM = `You are a document tutor. Generate quiz questions from the excerpts only.
Rules:
- Output a numbered list: 1. ... 2. ... etc. (5–8 questions unless the user specifies a number in their message — then match that count, max 12).
- Mix recall and short applied questions where the content allows.
- Do not include answers unless the user asked for an answer key.
- If excerpts lack substance for meaningful questions, say so in one short sentence instead of fabricating.`;

/**
 * @param {{ question: string, context: string, priorTurns: import('./conversationMemory.service').ChatTurn[] }} opts
 */
function buildSummarizeUserPrompt({ question, context, priorTurns }) {
  const history = buildHistoryPrefix(priorTurns);
  return `${history}## Document excerpts\n${context}\n\n---\n\n## User request\n${question.trim()}\n\n## Summary (one paragraph)\n`;
}

/**
 * @param {{ question: string, context: string, priorTurns: import('./conversationMemory.service').ChatTurn[] }} opts
 */
function buildQuizUserPrompt({ question, context, priorTurns }) {
  const history = buildHistoryPrefix(priorTurns);
  return `${history}## Document excerpts\n${context}\n\n---\n\n## User request\n${question.trim()}\n\n## Quiz questions\n`;
}

module.exports = {
  SUMMARIZE_SYSTEM,
  QUIZ_SYSTEM,
  buildSummarizeUserPrompt,
  buildQuizUserPrompt,
};
