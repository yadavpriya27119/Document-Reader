/**
 * Central registry for agent intents. Add new entries here to extend the agent.
 * @typedef {'summarize' | 'quiz' | 'default'} AgentIntentId
 */

/** @type {AgentIntentId[]} */
const INTENT_IDS = ['summarize', 'quiz', 'default'];

/** Execution / merge order when multiple intents apply */
const INTENT_PRIORITY = {
  summarize: 0,
  quiz: 1,
  default: 2,
};

/**
 * @param {string} id
 * @returns {id is AgentIntentId}
 */
function isValidIntent(id) {
  return INTENT_IDS.includes(id);
}

/**
 * @param {string[]} intents
 * @returns {AgentIntentId[]}
 */
function normalizeIntentList(intents) {
  const out = [];
  for (const raw of intents) {
    const id = String(raw || '').trim().toLowerCase();
    if (isValidIntent(id) && !out.includes(id)) out.push(id);
  }
  return out;
}

/**
 * @param {AgentIntentId[]} intents
 * @returns {AgentIntentId[]}
 */
function sortByPriority(intents) {
  return [...intents].sort(
    (a, b) => INTENT_PRIORITY[a] - INTENT_PRIORITY[b],
  );
}

module.exports = {
  INTENT_IDS,
  INTENT_PRIORITY,
  isValidIntent,
  normalizeIntentList,
  sortByPriority,
};
