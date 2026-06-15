/**
 * Persistent HUD: location indicator, interact prompt, time-of-day, achievements.
 */
import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENTS, useGame } from "../store";
import { POI_BY_ID, POIS } from "../data/locations";

export function HUD() {
  const nearby = useGame((s) => s.nearbyPOI);
  const visited = useGame((s) => s.visitedPOIs);
  const achievements = useGame((s) => s.achievements);
  const time = useGame((s) => s.timeOfDay);

  const total = POIS.length;
  const pct = Math.round((visited.length / total) * 100);

  const isNight = time < 0.25 || time > 0.75;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 font-mono text-white">
      {/* Top-left: title + progress */}
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        <div className="rounded-md border border-white/15 bg-black/45 px-3 py-2 backdrop-blur">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/90">Tarithcraft</div>
          <div className="text-xs text-slate-200">Discovered {visited.length}/{total} · {pct}%</div>
          <div className="mt-1 h-1 w-40 overflow-hidden rounded bg-white/10">
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Top-right: time + achievements count */}
      <div className="absolute right-4 top-4 flex flex-col items-end gap-2 text-right">
        <div className="rounded-md border border-white/15 bg-black/45 px-3 py-2 backdrop-blur">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/90">
            {isNight ? "Night" : "Day"}
          </div>
          <div className="text-xs">
            {Math.floor(time * 24).toString().padStart(2, "0")}:
            {Math.floor((time * 24 * 60) % 60).toString().padStart(2, "0")}
          </div>
        </div>
        <div className="rounded-md border border-white/15 bg-black/45 px-3 py-2 backdrop-blur">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/90">
            Achievements
          </div>
          <div className="text-xs">{achievements.length}/{ACHIEVEMENTS.length}</div>
        </div>
      </div>

      {/* Bottom-center: interact prompt */}
      <AnimatePresence>
        {nearby && (
          <motion.div
            key={nearby}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-md border border-amber-300/60 bg-black/70 px-5 py-3 text-center backdrop-blur"
          >
            <div className="text-[10px] uppercase tracking-[0.4em] text-amber-300">
              {POI_BY_ID[nearby].subtitle}
            </div>
            <div className="text-sm font-bold">{POI_BY_ID[nearby].name}</div>
            <div className="mt-1 text-[11px] text-slate-300">
              Press <kbd className="rounded border border-white/30 bg-white/10 px-1.5">E</kbd> to enter
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-left: mini-map of POIs (top-down dots) */}
      <div className="absolute bottom-4 left-4 h-40 w-40 overflow-hidden rounded-md border border-white/15 bg-black/45 backdrop-blur">
        <div className="relative h-full w-full">
          {POIS.map((p) => {
            const v = visited.includes(p.id);
            const x = (p.position[0] + 60) / 120;
            const z = (p.position[2] + 60) / 120;
            const isNear = nearby === p.id;
            return (
              <div
                key={p.id}
                title={p.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${x * 100}%`,
                  top: `${z * 100}%`,
                  width: isNear ? 10 : 6,
                  height: isNear ? 10 : 6,
                  background: v ? p.color : "#475569",
                  boxShadow: isNear ? `0 0 12px ${p.color}` : "none",
                }}
              />
            );
          })}
          {/* Center label */}
          <div className="absolute bottom-1 left-1 text-[9px] uppercase tracking-widest text-slate-300">
            Map
          </div>
        </div>
      </div>
    </div>
  );
}
