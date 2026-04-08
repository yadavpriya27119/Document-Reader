import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const TYPEWRITER_MAX_LEN = 380;
const TYPEWRITER_MS = 16;

const lineContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.026, delayChildren: 0.05 },
  },
};

const lineItem = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Streaming: live text. Short instant: typewriter + cursor. Long instant: line stagger.
 */
export function RevealAnswerText({ text, isStreaming, streamFinished, reducedMotion, onSettled }) {
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;
  const settledDone = useRef(false);

  const markSettled = useCallback(() => {
    if (settledDone.current) return;
    settledDone.current = true;
    onSettledRef.current?.();
  }, []);

  const useTypewriter =
    !reducedMotion && !isStreaming && text.length > 0 && text.length <= TYPEWRITER_MAX_LEN;

  const useLineStagger =
    !reducedMotion && !isStreaming && text.length > TYPEWRITER_MAX_LEN;

  const [twShown, setTwShown] = useState(() =>
    reducedMotion || isStreaming || useLineStagger ? text : useTypewriter ? '' : text
  );

  useEffect(() => {
    settledDone.current = false;
  }, [text]);

  useEffect(() => {
    if (isStreaming) {
      setTwShown(text);
      return undefined;
    }

    if (reducedMotion || useLineStagger) {
      setTwShown(text);
      return undefined;
    }

    if (!useTypewriter) {
      setTwShown(text);
      return undefined;
    }

    setTwShown('');
    let i = 0;
    let id;
    const tick = () => {
      i += 1;
      setTwShown(text.slice(0, i));
      if (i >= text.length) {
        markSettled();
        return;
      }
      id = window.setTimeout(tick, TYPEWRITER_MS);
    };
    id = window.setTimeout(tick, TYPEWRITER_MS);
    return () => window.clearTimeout(id);
  }, [text, isStreaming, reducedMotion, useTypewriter, useLineStagger, markSettled]);

  useEffect(() => {
    if (reducedMotion && text) {
      markSettled();
    }
  }, [reducedMotion, text, markSettled]);

  useEffect(() => {
    if (isStreaming && streamFinished && text) {
      markSettled();
    }
  }, [isStreaming, streamFinished, text, markSettled]);

  useEffect(() => {
    if (!useLineStagger || !text) return undefined;
    const ms = Math.min(2200, 260 + text.split('\n').length * 40);
    const t = window.setTimeout(markSettled, ms);
    return () => window.clearTimeout(t);
  }, [useLineStagger, text, markSettled]);

  if (isStreaming || reducedMotion) {
    return (
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{text}</p>
    );
  }

  if (useLineStagger) {
    const lines = text.split('\n');
    return (
      <motion.div
        className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700"
        variants={lineContainer}
        initial="hidden"
        animate="visible"
        onAnimationComplete={markSettled}
      >
        {lines.map((line, idx) => (
          <motion.div key={`${idx}-${line.slice(0, 12)}`} variants={lineItem} className="min-h-[1.15em]">
            {line || '\u00a0'}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (useTypewriter) {
    return (
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {twShown}
        {twShown.length < text.length ? (
          <motion.span
            className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 rounded-sm bg-violet-500"
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 0.72, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
        ) : null}
      </p>
    );
  }

  return <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{text}</p>;
}
