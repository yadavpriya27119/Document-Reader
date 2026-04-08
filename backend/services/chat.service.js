const chatCache = require('./chatCache.service');
const conversationMemory = require('./conversationMemory.service');
const { querySimilarText } = require('./vectorStore.service');
const { detectIntent } = require('./intentDetection.service');
const { runAgentPipeline } = require('./agentRouter.service');

/**
 * Enrich retrieval query with the last user message so coreferences ("it", "that") embed better.
 * @param {string} question
 * @param {import('./conversationMemory.service').ChatTurn[]} priorTurns
 */
function buildRetrievalQuery(question, priorTurns) {
  if (!priorTurns.length) return question;
  const lastUser = priorTurns[priorTurns.length - 1].user;
  const cap = 400;
  const prev = lastUser.length > cap ? `${lastUser.slice(0, cap)}…` : lastUser;
  return `${prev}\n\nFollow-up: ${question}`;
}

/**
 * Cache stores either legacy plain strings or structured rows (post-agent).
 * @param {unknown} raw
 * @returns {{ answer: string, intent: string, intents: string[], intentSource: string } | null}
 */
function unwrapCached(raw) {
  if (raw && typeof raw === 'object' && typeof raw.answer === 'string') {
    return {
      answer: raw.answer,
      intent: raw.intent || 'default',
      intents: Array.isArray(raw.intents) ? raw.intents : ['default'],
      intentSource: raw.intentSource || 'cache',
    };
  }
  if (typeof raw === 'string') {
    return {
      answer: raw,
      intent: 'default',
      intents: ['default'],
      intentSource: 'cache-legacy',
    };
  }
  return null;
}

/**
 * @param {string} question
 * @param {{ sessionId?: string | null }} [opts]
 */
async function runChat(question, opts = {}) {
  const sessionId = opts.sessionId?.trim() || null;
  const priorTurns = conversationMemory.getPriorTurns(sessionId);
  const hasMemory = priorTurns.length > 0;
  const key = chatCache.normalize(question);

  if (!hasMemory) {
    const hit = unwrapCached(chatCache.get(key));
    if (hit) {
      // eslint-disable-next-line no-console
      console.log(
        `[cache HIT] [${hit.intents.join(',')}] "${question}"`,
      );
      return {
        answer: hit.answer,
        source: 'cache',
        sessionId,
        intent: hit.intent,
        intents: hit.intents,
        intentSource: hit.intentSource,
      };
    }
  }

  const intentResult = await detectIntent(question);
  const intentsKey = intentResult.all.join(',');

  // eslint-disable-next-line no-console
  console.log(
    `[cache ${hasMemory ? 'SKIP (session history)' : 'MISS'}] [${intentsKey}] "${question}" → Pinecone + agent`,
  );

  const retrievalQuery = buildRetrievalQuery(question, priorTurns);
  const context = await querySimilarText(retrievalQuery);
  const answer = await runAgentPipeline(intentResult.all, {
    question,
    context,
    priorTurns,
  });

  if (!hasMemory) {
    chatCache.set(key, {
      answer,
      intent: intentResult.primary,
      intents: intentResult.all,
      intentSource: intentResult.source,
    });
    // eslint-disable-next-line no-console
    console.log(`[cache SAVE] "${question}" — cache size: ${chatCache.stats().size}`);
  }

  return {
    answer,
    source: 'llm',
    sessionId,
    intent: intentResult.primary,
    intents: intentResult.all,
    intentSource: intentResult.source,
  };
}

/**
 * Streams plain text; returns the full string after the client finishes reading (for memory append).
 * @returns {Promise<string>}
 */
async function streamPlainText(res, text, delayMs = 50) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

  const words = text.split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    res.write(i === 0 ? words[i] : ` ${words[i]}`);
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  res.end();
  return text;
}

module.exports = {
  runChat,
  streamPlainText,
  conversationMemory,
  newSessionId: conversationMemory.newSessionId,
};
