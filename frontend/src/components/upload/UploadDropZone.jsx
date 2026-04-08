import { motion } from 'framer-motion';

/**
 * Centered drag-and-drop target with file input. Copy stays non-technical.
 */
export function UploadDropZone({
  inputRef,
  accept,
  onPick,
  onFileChange,
  onDragOver,
  onDrop,
  disabled = false,
  className = '',
}) {
  return (
    <motion.div
      layout
      className={`w-full max-w-lg ${className}`}
      onDragOver={disabled ? undefined : onDragOver}
      onDrop={disabled ? undefined : onDrop}
    >
      <motion.button
        type="button"
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.005 }}
        whileTap={disabled ? undefined : { scale: 0.995 }}
        onClick={disabled ? undefined : onPick}
        className="group w-full rounded-3xl border-2 border-dashed border-slate-200/90 bg-white/75 px-8 py-14 shadow-sm shadow-slate-200/40 backdrop-blur-md transition-colors hover:border-violet-200 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-200/60 transition-transform group-hover:scale-[1.03]">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold tracking-tight text-slate-800">Drag &amp; Drop your file</p>
        <p className="mt-2 text-sm text-slate-500">or Click to Upload</p>
        <p className="mt-5 text-center text-xs text-slate-400">PDF, Word, or a simple text file</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={onFileChange}
        />
      </motion.button>
    </motion.div>
  );
}
