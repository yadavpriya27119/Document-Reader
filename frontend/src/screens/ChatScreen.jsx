import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  askChatJson,
  askChatStream,
  clearChatCache,
  clearChatSession,
  getStoredChatSessionId,
  setStoredChatSessionId,
} from '../api/chatApi';
import { AssistantReplyBubble } from '../components/chat/AssistantReplyBubble';

export function ChatScreen({ fileName }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [streamed, setStreamed] = useState(false);
  const [error, setError] = useState('');
  const [replyId, setReplyId] = useState(0);
  const [sessionId, setSessionId] = useState(() => getStoredChatSessionId());
  const [lastIntentLabel, setLastIntentLabel] = useState('');

  useEffect(() => {
    setStoredChatSessionId(sessionId);
  }, [sessionId]);

  const syncSession = useCallback((id) => {
    if (id) setSessionId(id);
  }, []);

  const send = useCallback(async () => {
    const q = question.trim();
    if (!q) return;
    setBusy(true);
    setReplyId((n) => n + 1);
    setAnswer('');
    setLastIntentLabel('');
    setError('');
    setStreamed(false);
    try {
      const { answer: a, intents } = await askChatJson(q, {
        sessionId,
        onSessionId: syncSession,
      });
      setAnswer(a);
      setLastIntentLabel(
        intents?.length > 1 ? intents.join(' + ') : intents?.[0] || '',
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [question, sessionId, syncSession]);

  const sendGradual = useCallback(async () => {
    const q = question.trim();
    if (!q) return;
    setBusy(true);
    setReplyId((n) => n + 1);
    setAnswer('');
    setLastIntentLabel('');
    setError('');
    setStreamed(true);
    try {
      const { text, intents } = await askChatStream(q, {
        delay: 24,
        sessionId,
        onSessionId: syncSession,
        onChunk: (acc) => setAnswer(acc),
      });
      setAnswer(text);
      setLastIntentLabel(
        intents?.length > 1 ? intents.join(' + ') : intents?.[0] || '',
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [question, sessionId, syncSession]);

  const reset = useCallback(async () => {
    try {
      await clearChatSession(sessionId);
      await clearChatCache();
      const next =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setSessionId(next);
      setStoredChatSessionId(next);
      setAnswer('');
      setLastIntentLabel('');
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [sessionId]);

  return (
    <div className="min-h-dvh px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-violet-600/90">
            Your document
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            Ask a question
          </h1>
          {fileName ? (
            <p className="mt-2 truncate text-sm text-slate-500" title={fileName}>
              Using: <span className="font-medium text-slate-700">{fileName}</span>
            </p>
          ) : null}
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-lg shadow-slate-300/20 backdrop-blur-md sm:p-8"
        >
          <label className="text-sm font-medium text-slate-700" htmlFor="q">
            What would you like to know?
          </label>
          <textarea
            id="q"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={busy}
            placeholder="For example: What are the main ideas in this file?"
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:opacity-50"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <motion.button
              type="button"
              disabled={busy}
              whileHover={{ scale: busy ? 1 : 1.02 }}
              whileTap={{ scale: busy ? 1 : 0.98 }}
              onClick={send}
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-fuchsia-200 disabled:opacity-50"
            >
              {busy && !streamed ? 'Thinking…' : 'Get answer'}
            </motion.button>
            <motion.button
              type="button"
              disabled={busy}
              whileHover={{ scale: busy ? 1 : 1.02 }}
              whileTap={{ scale: busy ? 1 : 0.98 }}
              onClick={sendGradual}
              className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-200 hover:bg-violet-50/50 disabled:opacity-50"
            >
              {busy && streamed ? 'Writing…' : 'Show answer slowly'}
            </motion.button>
            <button
              type="button"
              disabled={busy}
              onClick={reset}
              className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              Start fresh
            </button>
          </div>

          <AnimatePresence>
            {error ? (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0 }}
                className="mt-4 text-sm text-red-600"
              >
                {error}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {answer ? (
              <div key={replyId} className="mt-6">
                {lastIntentLabel ? (
                  <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-violet-600/85">
                    {lastIntentLabel === 'default'
                      ? 'Document Q&A'
                      : lastIntentLabel
                          .split(' + ')
                          .map((id) =>
                            id === 'summarize'
                              ? 'Summary'
                              : id === 'quiz'
                                ? 'Quiz'
                                : id,
                          )
                          .join(' · ')}
                  </p>
                ) : null}
                <AssistantReplyBubble
                  text={answer}
                  isStreaming={streamed}
                  isBusy={busy}
                />
              </div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Answers come only from your uploaded file. Scanned PDFs without text may not work.
        </p>
      </div>
    </div>
  );
}
