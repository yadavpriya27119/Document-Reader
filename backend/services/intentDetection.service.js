const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const {
  isValidIntent,
  normalizeIntentList,
  sortByPriority,
} = require('../constants/agentIntents');

/** @typedef {import('../constants/agentIntents').AgentIntentId} AgentIntentId */

/**
 * @typedef {{ primary: AgentIntentId, all: AgentIntentId[], source: 'llm' | 'rules' | 'fallback' }} IntentDetectionResult
 */

const SUMMARIZE_RE =
  /\b(summar(y|ize|ise|ization|isation)|tl;?dr|tldr|overview|main points|key points|gist|in brief|brief summary|executive summary|recap|synopsis)\b/i;
const QUIZ_RE =
  /\b(quiz|quizz|test me|practice questions?|exam questions?|flash\s*cards?|mock test|assess(ment)?|check my understanding)\b/i;

function getClassifierModel() {
  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  return genAI.getGenerativeModel({
    model: config.gemini.model,
    systemInstruction: `You classify short user messages about a document (PDF/text) chat assistant.
Valid intent IDs (use exactly these strings):
- summarize — user wants a summary, overview, TL;DR, key points, recap
- quiz — user wants practice questions, a quiz, flashcards, or to test retention
- default — specific Q&A, explanations, comparisons, "what is…", or unclear/generic chat

Rules:
- If multiple intents apply, list up to 2 in "intents" in the order they should be executed (summary before quiz if both).
- "intent" must equal the first item in "intents".
- If ambiguous or off-topic for document tasks, use default.

Reply with ONLY a JSON object, no markdown:
{"intent":"summarize|quiz|default","intents":["..."],"confidence":0.0}`,
  });
}

/**
 * Keyword / pattern fallback. Detects multiple signals; merges with fixed priority.
 * @param {string} text
 * @returns {IntentDetectionResult}
 */
function detectIntentRuleBased(text) {
  const t = text.trim();
  /** @type {AgentIntentId[]} */
  const hits = [];
  if (SUMMARIZE_RE.test(t)) hits.push('summarize');
  if (QUIZ_RE.test(t)) hits.push('quiz');
  const unique = normalizeIntentList(hits);
  if (!unique.length) {
    return { primary: 'default', all: ['default'], source: 'rules' };
  }
  const all = sortByPriority(unique);
  return { primary: all[0], all, source: 'rules' };
}

/**
 * @param {string} raw
 * @returns {IntentDetectionResult | null}
 */
function parseIntentJson(raw) {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
  const primaryRaw = parsed.intent ?? parsed.primary;
  let all = normalizeIntentList(
    Array.isArray(parsed.intents) ? parsed.intents : [primaryRaw],
  );
  if (!all.length && isValidIntent(String(primaryRaw).toLowerCase())) {
    all = [String(primaryRaw).toLowerCase()];
  }
  if (!all.length) return null;
  all = sortByPriority(all).slice(0, 2);
  let primary = isValidIntent(String(primaryRaw).toLowerCase())
    ? String(primaryRaw).toLowerCase()
    : all[0];
  if (!all.includes(primary)) primary = all[0];
  return { primary, all, source: 'llm' };
}

/**
 * @param {string} userMessage
 * @returns {Promise<IntentDetectionResult>}
 */
async function detectIntentWithLlm(userMessage) {
  const model = getClassifierModel();
  const prompt = `Classify this user message:\n"""${userMessage.replace(/"""/g, '"')}"""`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseIntentJson(text);
  if (parsed) return parsed;
  return { primary: 'default', all: ['default'], source: 'fallback' };
}

/**
 * Hybrid: strong dual-signal rules skip LLM; otherwise LLM with rule fallback on error.
 * @param {string} userMessage
 * @param {{ preferRules?: boolean }} [opts]
 * @returns {Promise<IntentDetectionResult>}
 */
async function detectIntent(userMessage, opts = {}) {
  const msg = userMessage.trim();
  if (!msg) {
    return { primary: 'default', all: ['default'], source: 'fallback' };
  }

  const rules = detectIntentRuleBased(msg);

  if (opts.preferRules) {
    return rules;
  }

  // Two clear keyword families → trust rules (saves latency; handles multi-intent locally)
  if (rules.all.length > 1) {
    return rules;
  }

  try {
    const llm = await detectIntentWithLlm(msg);
    if (llm.source === 'fallback') return rules;
    return llm;
  } catch {
    return rules.primary === 'default' && rules.all.length === 1
      ? { primary: 'default', all: ['default'], source: 'fallback' }
      : rules;
  }
}

module.exports = {
  detectIntent,
  detectIntentRuleBased,
  detectIntentWithLlm,
  parseIntentJson,
};
