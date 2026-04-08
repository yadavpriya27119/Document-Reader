import { AmbientBackground } from './AmbientBackground';

/**
 * Global shell: fixed ambient layer + foreground slot. Keeps upload, flip, and chat on one canvas.
 */
export function AppCanvas({ children }) {
  return (
    <div className="relative min-h-dvh text-slate-900 antialiased">
      <AmbientBackground />
      <div className="relative z-[1] min-h-dvh">{children}</div>
    </div>
  );
}
