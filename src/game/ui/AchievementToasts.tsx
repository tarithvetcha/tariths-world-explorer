/**
 * Achievement toast (top-center). Appears whenever a new achievement is unlocked.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ACHIEVEMENTS, useGame } from "../store";

const TIER_COLORS: Record<string, string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-slate-400 to-slate-200",
  gold: "from-amber-400 to-yellow-300",
  diamond: "from-cyan-300 to-sky-400",
  legendary: "from-fuchsia-400 to-amber-300",
};

export function AchievementToasts() {
  const achievements = useGame((s) => s.achievements);
  const prevRef = useRef<string[]>(achievements);
  const [queue, setQueue] = useState<string[]>([]);

  useEffect(() => {
    const added = achievements.filter((a) => !prevRef.current.includes(a));
    prevRef.current = achievements;
    if (added.length) setQueue((q) => [...q, ...added]);
  }, [achievements]);

  useEffect(() => {
    if (!queue.length) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 3500);
    return () => clearTimeout(t);
  }, [queue]);

  const current = queue[0];
  const def = ACHIEVEMENTS.find((a) => a.id === current);

  return (
    <div className="pointer-events-none absolute left-1/2 top-6 z-40 -translate-x-1/2">
      <AnimatePresence>
        {def && (
          <motion.div
            key={def.id}
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="rounded-lg border border-white/20 bg-black/80 px-5 py-3 text-center text-white shadow-2xl backdrop-blur"
          >
            <div className={`mx-auto inline-block rounded bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black ${TIER_COLORS[def.tier]}`}>
              {def.tier} Achievement
            </div>
            <div className="mt-2 text-lg font-black">{def.title}</div>
            <div className="text-xs text-slate-300">{def.description}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
