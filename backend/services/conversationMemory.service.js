const crypto = require('crypto');
const config = require('../config');

/** @typedef {{ user: string, assistant: string }} ChatTurn */

/** @type {Map<string, { turns: ChatTurn[], updatedAt: number }>} */
const sessions = new Map();

const { maxTurns, maxHistoryChars } = config.chatMemory;

function newSessionId() {
  return crypto.randomUUID();
}

/**
 * Returns prior turns only (excludes the message currently being answered).
 * @param {string | null | undefined} sessionId
 * @returns {ChatTurn[]}
 */
function getPriorTurns(sessionId) {
  if (!sessionId) return [];
  const row = sessions.get(sessionId);
  return row ? row.turns.map((t) => ({ ...t })) : [];
}

/**
 * Append after the assistant reply is fully known (including after streaming completes).
 * @param {string | null | undefined} sessionId
 * @param {string} user
 * @param {string} assistant
 */
function appendTurn(sessionId, user, assistant) {
  if (!sessionId) return;
  const u = user.trim();
  const a = assistant.trim();
  if (!u || !a) return;

  let row = sessions.get(sessionId);
  if (!row) {
    row = { turns: [], updatedAt: Date.now() };
    sessions.set(sessionId, row);
  }

  row.turns.push({ user: u, assistant: a });
  row.updatedAt = Date.now();

  while (row.turns.length > maxTurns) {
    row.turns.shift();
  }
}

/**
 * @param {string | null | undefined} sessionId
 */
function clearSession(sessionId) {
  if (!sessionId) return false;
  return sessions.delete(sessionId);
}

function stats() {
  return { sessions: sessions.size };
}

module.exports = {
  newSessionId,
  getPriorTurns,
  appendTurn,
  clearSession,
  stats,
  /** @internal for tests / prompt builder budget */
  _maxHistoryChars: maxHistoryChars,
};
