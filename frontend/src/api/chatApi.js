import { apiUrl, parseJsonResponse } from './client';

const SESSION_STORAGE_KEY = 'pdfreader-chat-session';

export function getStoredChatSessionId() {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredChatSessionId(id) {
  if (!id) {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

function tryExtractAnswerFromJsonString(raw) {
  const t = raw.trim();
  if (!t.startsWith('{')) return raw;
  try {
    const j = JSON.parse(t);
    if (typeof j.answer === 'string') return j.answer;
  } catch {
    /* not JSON */
  }
  return raw;
}

function chatPayload(question, sessionId) {
  const body = { question };
  if (sessionId) body.sessionId = sessionId;
  return body;
}

/**
 * @param {string} question
 * @param {{ sessionId?: string, onSessionId?: (id: string) => void }} [opts]
 */
export async function askChatJson(question, opts = {}) {
  const { sessionId = '', onSessionId } = opts;
  const res = await fetch(apiUrl('/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatPayload(question, sessionId)),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }
  const sid = data.sessionId || res.headers.get('X-Chat-Session') || '';
  if (sid) onSessionId?.(sid);
  return {
    ...data,
    intent: data.intent,
    intents: data.intents,
    intentSource: data.intentSource,
  };
}

/**
 * Streams plain text body; invokes onChunk with accumulated text.
 * If the server returns JSON (misconfigured stream), we still show the answer string.
 * @param {string} question
 * @param {{ delay?: number, onChunk?: (acc: string) => void, sessionId?: string, onSessionId?: (id: string) => void }} [opts]
 */
export async function askChatStream(question, opts = {}) {
  const { delay = 35, onChunk, sessionId = '', onSessionId } = opts;
  const res = await fetch(apiUrl(`/chat?stream=1&delay=${delay}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...chatPayload(question, sessionId), stream: true }),
  });

  const headerSession = res.headers.get('X-Chat-Session') || '';
  if (headerSession) onSessionId?.(headerSession);

  const source = res.headers.get('X-Chat-Source') || '';
  const intent = res.headers.get('X-Chat-Intent') || '';
  const intents = (res.headers.get('X-Chat-Intents') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const intentSource = res.headers.get('X-Chat-Intent-Source') || '';

  if (!res.ok) {
    const data = await parseJsonResponse(res);
    throw new Error(data.error || res.statusText);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Streaming not supported in this browser');
  }

  const decoder = new TextDecoder();
  let acc = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    onChunk?.(tryExtractAnswerFromJsonString(acc));
  }

  const text = tryExtractAnswerFromJsonString(acc);
  return {
    text,
    source,
    sessionId: headerSession,
    intent,
    intents,
    intentSource,
  };
}

export async function clearChatCache() {
  const res = await fetch(apiUrl('/cache'), { method: 'DELETE' });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }
  return data;
}

/**
 * Clears server-side conversation memory for this session.
 * @param {string} sessionId
 */
export async function clearChatSession(sessionId) {
  if (!sessionId) return { ok: true };
  const q = new URLSearchParams({ sessionId }).toString();
  const res = await fetch(apiUrl(`/chat/session?${q}`), { method: 'DELETE' });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }
  return data;
}
