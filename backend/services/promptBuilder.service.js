const { _maxHistoryChars } = require('./conversationMemory.service');

/**
 * @param {import('./conversationMemory.service').ChatTurn[]} turns
 * @returns {string}
 */
function formatHistoryBlock(turns) {
  if (!turns.length) return '';
  return turns
    .map(
      (t, i) =>
        `### Exchange ${i + 1}\nUser: ${t.user}\nAssistant: ${t.assistant}`,
    )
    .join('\n\n');
}

/**
 * Drop oldest exchanges until the formatted block fits maxChars (rough token control).
 * @param {import('./conversationMemory.service').ChatTurn[]} turns
 * @param {number} [maxChars]
 * @returns {import('./conversationMemory.service').ChatTurn[]}
 */
function trimTurnsToCharBudget(turns, maxChars = _maxHistoryChars) {
  if (!turns.length) return turns;
  let slice = turns;
  while (slice.length > 0 && formatHistoryBlock(slice).length > maxChars) {
    slice = slice.slice(1);
  }
  return slice;
}

/**
 * Builds the RAG user message: optional history + excerpts + current question.
 * @param {{ question: string, context: string, priorTurns: import('./conversationMemory.service').ChatTurn[] }} opts
 */
function buildRagUserPrompt({ question, context, priorTurns }) {
  const trimmed = trimTurnsToCharBudget(priorTurns);
  const historyBlock = formatHistoryBlock(trimmed);

  const historySection = historyBlock
    ? `## Prior conversation\nUse this only to resolve follow-ups (pronouns, "the above", etc.). If the current question is clearly unrelated, ignore it and rely on the document excerpts.\n\n${historyBlock}\n\n---\n\n`
    : '';

  return `${historySection}## Document excerpts\n${context}\n\n---\n\n## Current question\n${question.trim()}\n\n## Answer\n`;
}

module.exports = {
  formatHistoryBlock,
  trimTurnsToCharBudget,
  buildRagUserPrompt,
};
