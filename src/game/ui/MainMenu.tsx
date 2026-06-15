/**
 * Main menu (start screen). Voxel aesthetic, animated.
 */
import { motion } from "framer-motion";
import { useGame } from "../store";

export function MainMenu() {
  const setStarted = useGame((s) => s.setStarted);
  const reset = useGame((s) => s.reset);
  const visited = useGame((s) => s.visitedPOIs.length);
  const hasSave = visited > 0;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-[#0b1023] via-[#0f172a] to-[#020617] text-white">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-amber-300/80">
          A voxel portfolio adventure
        </div>
        <h1 className="mt-3 text-6xl md:text-8xl font-black tracking-tight">
          TARITH<span className="text-amber-400">CRAFT</span>
        </h1>
        <p className="mt-4 max-w-xl text-balance text-sm md:text-base text-slate-300">
          Explore a handcrafted world to discover Tarith Vetcha&apos;s journey as an aspiring gameplay programmer.
          Every place tells a story.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-10 flex flex-col items-center gap-3"
      >
        <button
          onClick={() => setStarted(true)}
          className="group relative overflow-hidden rounded-md border-2 border-amber-400 bg-amber-400 px-10 py-3 font-bold text-black transition-transform hover:scale-[1.03]"
        >
          {hasSave ? "Continue Adventure" : "Begin Adventure"}
        </button>
        {hasSave && (
          <button
            onClick={() => reset()}
            className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline"
          >
            Start over ({visited} discovered)
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 text-center text-xs text-slate-400"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Keycap>W A S D</Keycap> <span>Move</span>
          <Keycap>Shift</Keycap> <span>Sprint</span>
          <Keycap>Space</Keycap> <span>Jump</span>
          <Keycap>E</Keycap> <span>Interact</span>
          <Keycap>Mouse</Keycap> <span>Look</span>
        </div>
        <div className="mt-2">Click the world to lock the camera.</div>
      </motion.div>
    </div>
  );
}

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-slate-600 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-amber-200">
      {children}
    </kbd>
  );
}
