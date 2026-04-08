const {
  runChat,
  streamPlainText,
  conversationMemory,
  newSessionId,
} = require('../services/chat.service');

function wantsStream(req) {
  return (
    req.query.stream === '1' ||
    req.query.stream === 'true' ||
    req.body?.stream === true
  );
}

function streamDelayMs(req) {
  return Math.min(200, Math.max(0, Number(req.query.delay) || 50));
}

function resolveSessionId(req) {
  const fromBody = req.body?.sessionId?.trim();
  const fromHeader = req.headers['x-chat-session']?.trim();
  return fromBody || fromHeader || null;
}

async function postChat(req, res) {
  const question = req.body?.question?.trim();
  if (!question) {
    return res.status(400).json({ error: 'Provide a "question" field.' });
  }

  let sessionId = resolveSessionId(req);
  if (!sessionId) {
    sessionId = newSessionId();
  }
  res.setHeader('X-Chat-Session', sessionId);

  try {
    const { answer, source, intent, intents, intentSource } = await runChat(
      question,
      { sessionId },
    );

    if (wantsStream(req)) {
      res.setHeader('X-Chat-Source', source);
      if (intent) res.setHeader('X-Chat-Intent', intent);
      if (intents?.length)
        res.setHeader('X-Chat-Intents', intents.join(','));
      if (intentSource) res.setHeader('X-Chat-Intent-Source', intentSource);
      const finalText = await streamPlainText(res, answer, streamDelayMs(req));
      conversationMemory.appendTurn(sessionId, question, finalText);
      return;
    }

    conversationMemory.appendTurn(sessionId, question, answer);
    return res.json({
      answer,
      source,
      sessionId,
      intent,
      intents,
      intentSource,
    });
  } catch (err) {
    if (res.headersSent) {
      res.end();
      return;
    }
    return res.status(500).json({ error: err.message });
  }
}

async function deleteChatSession(req, res) {
  const sessionId =
    resolveSessionId(req) || String(req.query.sessionId || '').trim() || null;
  if (!sessionId) {
    return res.status(400).json({
      error: 'Provide sessionId in body, X-Chat-Session header, or ?sessionId=.',
    });
  }
  conversationMemory.clearSession(sessionId);
  return res.json({ ok: true });
}

module.exports = { postChat, deleteChatSession };
