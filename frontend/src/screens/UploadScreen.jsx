import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadProgress } from './UploadProgress';
import { uploadDocumentWithProgress } from '../api/documentsApi';
import { TypewriterText } from '../components/upload/TypewriterText';
import { UploadDropZone } from '../components/upload/UploadDropZone';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const INTRO_HEADLINE = 'Upload your document to start searching';

const EASE_SMOOTH = [0.45, 0, 0.55, 1];
const EASE_OUT = [0.22, 1, 0.36, 1];

const SPLASH_MS = 640;
const AFTER_TYPEWRITER_MS = 480;
const COMPACT_TO_READY_MS = 800;

export function UploadScreen({ onComplete }) {
  const inputRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [introStage, setIntroStage] = useState(() => (reducedMotion ? 'ready' : 'splash'));

  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [skipDropEntrance, setSkipDropEntrance] = useState(false);

  const pick = useCallback(() => inputRef.current?.click(), []);

  const onFiles = useCallback((list) => {
    const f = list?.[0];
    if (f) {
      setFile(f);
      setError('');
    }
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      onFiles(e.dataTransfer?.files);
    },
    [onFiles]
  );

  const onDragOverScreen = useCallback((e) => {
    if (phase === 'idle') e.preventDefault();
  }, [phase]);

  useEffect(() => {
    if (reducedMotion || introStage !== 'splash') return undefined;
    const id = window.setTimeout(() => setIntroStage('typing'), SPLASH_MS);
    return () => window.clearTimeout(id);
  }, [introStage, reducedMotion]);

  useEffect(() => {
    if (introStage !== 'compact') return undefined;
    const id = window.setTimeout(() => setIntroStage('ready'), COMPACT_TO_READY_MS);
    return () => window.clearTimeout(id);
  }, [introStage]);

  useEffect(() => {
    if (phase !== 'uploading') return undefined;
    const id = setInterval(() => {
      setProgress((p) => (p < 0.97 ? Math.min(0.97, p + 0.012) : p));
    }, 380);
    return () => clearInterval(id);
  }, [phase]);

  const onTypewriterComplete = useCallback(() => {
    window.setTimeout(() => setIntroStage('compact'), AFTER_TYPEWRITER_MS);
  }, []);

  const startUpload = useCallback(async () => {
    if (!file) {
      setError('Choose a file first.');
      return;
    }
    setPhase('uploading');
    setSkipDropEntrance(true);
    setProgress(0);
    setError('');
    try {
      await uploadDocumentWithProgress(file, setProgress);
      await new Promise((r) => setTimeout(r, 450));
      onComplete?.({ fileName: file.name });
    } catch (e) {
      setError(e.message);
      setPhase('idle');
      setProgress(0);
    }
  }, [file, onComplete]);

  const showHeadlineTyping = introStage === 'typing';
  const headlineAtTop = introStage === 'compact' || introStage === 'ready' || reducedMotion;
  const showDropUi = phase === 'idle' && introStage === 'ready';

  const easeInOut = reducedMotion ? { duration: 0.01 } : { duration: 0.88, ease: EASE_SMOOTH };
  const screenEnter = reducedMotion
    ? { duration: 0 }
    : { duration: 0.62, ease: EASE_OUT };

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-x-hidden"
      onDragOver={onDragOverScreen}
      onDrop={phase === 'idle' ? onDrop : undefined}
    >
      <motion.div
        className="flex min-h-dvh flex-1 flex-col"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={screenEnter}
      >
        {phase === 'uploading' ? (
          <motion.div
            key="uploading"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14"
          >
            <div className="w-full max-w-lg">
              <UploadProgress progress={progress} fileName={file?.name} />
            </div>
            {error ? (
              <p className="mt-6 text-center text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </motion.div>
        ) : (
          <>
            <motion.header
              className="flex w-full flex-col items-center px-4"
              initial={false}
              animate={{
                paddingTop: headlineAtTop
                  ? 'max(1rem, env(safe-area-inset-top, 0px))'
                  : 'min(36vh, 300px)',
                paddingBottom: headlineAtTop ? '0.5rem' : '1rem',
              }}
              transition={easeInOut}
            >
              <motion.h1
                className="max-w-[min(100%,22rem)] text-center font-semibold tracking-tight text-slate-800 sm:max-w-lg"
                initial={false}
                animate={{
                  fontSize: headlineAtTop
                    ? 'clamp(1.35rem, 4.5vw, 1.875rem)'
                    : 'clamp(1.625rem, 5.5vw, 2.35rem)',
                  lineHeight: headlineAtTop ? 1.4 : 1.25,
                }}
                transition={easeInOut}
              >
                <span className="sr-only">{INTRO_HEADLINE}</span>
                <span aria-hidden="true" className="block">
                  {showHeadlineTyping ? (
                    <TypewriterText
                      text={INTRO_HEADLINE}
                      charIntervalMs={34}
                      startDelayMs={120}
                      onComplete={onTypewriterComplete}
                    />
                  ) : introStage === 'splash' ? (
                    <span className="inline-block min-h-[1.2em] opacity-0">.</span>
                  ) : (
                    INTRO_HEADLINE
                  )}
                </span>
              </motion.h1>
            </motion.header>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-start px-4 pt-5 pb-10">
              <AnimatePresence mode="wait">
                {showDropUi ? (
                  <motion.div
                    key="dropzone"
                    initial={
                      reducedMotion || skipDropEntrance ? false : { opacity: 0, y: 56 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{
                      opacity: {
                        duration: 0.55,
                        delay: reducedMotion || skipDropEntrance ? 0 : 0.06,
                        ease: EASE_OUT,
                      },
                      y: {
                        duration: 0.62,
                        delay: reducedMotion || skipDropEntrance ? 0 : 0.06,
                        ease: EASE_SMOOTH,
                      },
                    }}
                    className="flex w-full max-w-lg flex-col items-center"
                  >
                    <UploadDropZone
                      inputRef={inputRef}
                      accept=".pdf,.docx,.txt"
                      onPick={pick}
                      onFileChange={(e) => onFiles(e.target.files)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={onDrop}
                    />

                    <AnimatePresence>
                      {file ? (
                        <motion.div
                          key="file-row"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.4, ease: EASE_OUT }}
                          className="mt-8 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center"
                        >
                          <p
                            className="max-w-full truncate text-center text-sm font-medium text-slate-600 sm:max-w-[220px]"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={startUpload}
                            className="rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-9 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-300/35"
                          >
                            Continue
                          </motion.button>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    {error ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-5 text-center text-sm text-red-600"
                        role="alert"
                      >
                        {error}
                      </motion.p>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
