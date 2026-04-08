const { sortByPriority } = require('../constants/agentIntents');
const {
  answerFromContext,
  generateWithSystemInstruction,
} = require('./llm.service');
const {
  SUMMARIZE_SYSTEM,
  QUIZ_SYSTEM,
  buildSummarizeUserPrompt,
  buildQuizUserPrompt,
} = require('./agentPrompts.service');

/** @typedef {import('../constants/agentIntents').AgentIntentId} AgentIntentId */

const MAX_INTENTS_PER_TURN = 2;

/**
 * @param {AgentIntentId} intent
 * @param {{ question: string, context: string, priorTurns: import('./conversationMemory.service').ChatTurn[] }} ctx
 * @returns {Promise<string>}
 */
async function runSingleIntent(intent, ctx) {
  const { question, context, priorTurns } = ctx;
  if (intent === 'summarize') {
    const userPart = buildSummarizeUserPrompt({
      question,
      context,
      priorTurns,
    });
    return generateWithSystemInstruction(SUMMARIZE_SYSTEM, userPart);
  }
  if (intent === 'quiz') {
    const userPart = buildQuizUserPrompt({ question, context, priorTurns });
    return generateWithSystemInstruction(QUIZ_SYSTEM, userPart);
  }
  return answerFromContext(question, context, priorTurns);
}

/**
 * @param {AgentIntentId[]} intents
 * @param {{ question: string, context: string, priorTurns: import('./conversationMemory.service').ChatTurn[] }} ctx
 * @returns {Promise<string>}
 */
async function runAgentPipeline(intents, ctx) {
  const ordered = sortByPriority([...new Set(intents)]).slice(
    0,
    MAX_INTENTS_PER_TURN,
  );
  if (ordered.length <= 1) {
    return runSingleIntent(ordered[0] || 'default', ctx);
  }

  const parts = [];
  for (const intent of ordered) {
    const body = (await runSingleIntent(intent, ctx)).trim();
    const heading =
      intent === 'summarize'
        ? 'Summary'
        : intent === 'quiz'
          ? 'Quiz'
          : 'Answer';
    parts.push(`## ${heading}\n\n${body}`);
  }
  return parts.join('\n\n---\n\n');
}

module.exports = {
  runSingleIntent,
  runAgentPipeline,
  MAX_INTENTS_PER_TURN,
};
