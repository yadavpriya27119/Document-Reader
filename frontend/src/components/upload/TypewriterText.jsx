import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Letter-by-letter reveal with optional blinking cursor. Calls onComplete once when finished.
 */
export function TypewriterText({
  text,
  charIntervalMs = 36,
  startDelayMs = 0,
  onComplete,
  className = '',
  cursor = true,
  instant = false,
}) {
  const [index, setIndex] = useState(() => (instant ? text.length : 0));
  const [started, setStarted] = useState(instant);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (instant) {
      setIndex(text.length);
      setStarted(true);
      return undefined;
    }
    completedRef.current = false;
    setIndex(0);
    setStarted(false);
    const t = window.setTimeout(() => setStarted(true), startDelayMs);
    return () => window.clearTimeout(t);
  }, [instant, startDelayMs, text]);

  useEffect(() => {
    if (instant || !started) return undefined;
    if (index >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return undefined;
    }
    const id = window.setTimeout(() => setIndex((n) => n + 1), charIntervalMs);
    return () => window.clearTimeout(id);
  }, [instant, started, index, text.length, charIntervalMs]);

  const visible = text.slice(0, index);
  const done = index >= text.length;

  return (
    <span className={className}>
      <span>{visible}</span>
      {cursor ? (
        <motion.span
          className="inline-block w-[0.06em] translate-y-px text-violet-500/90"
          animate={{ opacity: done ? 0 : [1, 0.2, 1] }}
          transition={
            done ? { duration: 0.2 } : { duration: 0.85, repeat: Infinity, ease: 'easeInOut' }
          }
          aria-hidden="true"
        >
          |
        </motion.span>
      ) : null}
    </span>
  );
}
