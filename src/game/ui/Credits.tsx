/**
 * Final cinematic. Plays when the player visits the Summit POI.
 */
import { motion } from "framer-motion";
import { PROFILE } from "../data/portfolio";
import { useGame } from "../store";

export function Credits() {
  const show = useGame((s) => s.showCredits);
  const close = useGame((s) => s.setShowCredits);
  const visited = useGame((s) => s.visitedPOIs.length);
  const ach = useGame((s) => s.achievements.length);

  if (!show) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black p-6 text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="w-full max-w-2xl text-center"
      >
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-5xl font-black tracking-tight"
        >
          Thank you for exploring
          <br />
          <span className="text-amber-300">my world.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mx-auto mt-6 max-w-xl text-balance text-slate-300"
        >
          This portfolio represents not only what I have built, but everything I aspire to create
          in the future. The adventure has only just begun.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="mt-10 space-y-4"
        >
          <div className="text-xs uppercase tracking-[0.4em] text-amber-300/80">
            {visited} places · {ach} achievements
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a className="rounded-md border border-amber-300 bg-amber-300 px-5 py-2 font-bold text-black hover:bg-amber-200" href={`mailto:${PROFILE.contact.email}`}>
              Hire Me
            </a>
            <a className="rounded-md border border-white/30 px-5 py-2 hover:bg-white/10" href={PROFILE.contact.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <span className="rounded-md border border-white/20 px-5 py-2 text-slate-400">
              GitHub · updating soon
            </span>
          </div>
          <div className="pt-6">
            <button onClick={() => close(false)} className="text-xs text-slate-400 underline-offset-4 hover:text-white hover:underline">
              Return to the world
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
