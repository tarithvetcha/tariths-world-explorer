/**
 * POI content panel — opens on interaction. Renders the right content per location.
 * Closing this also unlocks pointer-lock so menu/HUD remain interactive.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useGame } from "../store";
import { POI_BY_ID } from "../data/locations";
import {
  PROFILE,
  EXPERIENCE,
  PROJECTS,
  BLENDER_RENDERS,
  AI_ROADMAP,
  ARVR,
} from "../data/portfolio";
import { VideoCard } from "./VideoCard";

export function POIPanel() {
  const active = useGame((s) => s.activePOI);
  const close = useGame((s) => s.closePOI);
  const openMG = useGame((s) => s.openMiniGame);

  // Release pointer lock the instant a panel opens
  useEffect(() => {
    if (active && document.pointerLockElement) document.exitPointerLock();
  }, [active]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && active) close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  const poi = active ? POI_BY_ID[active] : null;

  return (
    <AnimatePresence>
      {poi && (
        <motion.div
          key={poi.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-xl border border-amber-300/20 bg-[#0b1023] text-white shadow-2xl"
          >
            <div
              className="flex items-center justify-between border-b border-white/10 px-6 py-4"
              style={{ background: `linear-gradient(135deg, ${poi.color}22, transparent)` }}
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em]" style={{ color: poi.color }}>
                  {poi.subtitle}
                </div>
                <h2 className="text-2xl font-black">{poi.name}</h2>
              </div>
              <button
                onClick={close}
                className="rounded border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
              >
                Close · ESC
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-6 py-5 text-sm leading-relaxed text-slate-200">
              {poi.id === "spawn" && (
                <div className="space-y-3">
                  <p>
                    Welcome to Tarithcraft. This isn&apos;t a portfolio site — it&apos;s a small
                    world built to introduce you to <b>{PROFILE.name}</b>.
                  </p>
                  <p>
                    Wander around. Each beacon marks a story — projects, training, renders, mini-games,
                    and the people behind it.
                  </p>
                  <p className="text-amber-300/90">Tip: chase the highest peak when you&apos;re ready for the finale.</p>
                </div>
              )}

              {poi.id === "village" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-amber-300">{PROFILE.name}</h3>
                  <p className="text-slate-300">{PROFILE.tagline}</p>
                  <p>{PROFILE.education}</p>
                  <p>{PROFILE.personal}</p>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-amber-300/80">Interests</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {PROFILE.interests.map((i) => (
                        <span key={i} className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-xs">{i}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded border border-amber-300/20 bg-amber-500/5 p-3 text-amber-200">
                    <div className="text-[10px] uppercase tracking-widest text-amber-300">Mission</div>
                    <div className="mt-1 text-sm">{PROFILE.mission}</div>
                  </div>
                </div>
              )}

              {poi.id === "workshop" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-amber-300">{EXPERIENCE.title}</h3>
                  <p>{EXPERIENCE.body}</p>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-amber-300/80">What I&apos;ve learned</div>
                    <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {EXPERIENCE.learned.map((l) => (
                        <li key={l} className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-amber-300" /> {l}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-amber-300/80">What&apos;s next</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {EXPERIENCE.next.map((n) => (
                        <span key={n} className="rounded border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200">{n}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {poi.id === "library" && (
                <div className="space-y-6">
                  <p className="text-slate-300">Every project below has a real, working build — videos play in-world.</p>
                  {PROJECTS.map((p) => (
                    <article key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-bold">{p.title}</h4>
                          <div className="mt-0.5 text-[10px] uppercase tracking-widest text-amber-300/80">{p.status.replace("-", " ")}</div>
                        </div>
                        {p.confidential && (
                          <span className="shrink-0 rounded border border-red-400/30 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">
                            NDA · clips only
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-slate-300">{p.blurb}</p>
                      <details className="mt-3 group">
                        <summary className="cursor-pointer text-xs uppercase tracking-widest text-amber-300/90 group-open:text-amber-300">Role · Tech · Challenges</summary>
                        <div className="mt-2 space-y-2 text-xs text-slate-300">
                          <div><b className="text-white">Role:</b><ul className="ml-4 list-disc">{p.role.map((r) => <li key={r}>{r}</li>)}</ul></div>
                          <div><b className="text-white">Tech:</b> {p.tech.join(" · ")}</div>
                          <div><b className="text-white">Challenges:</b> {p.challenges}</div>
                          <div><b className="text-white">Future:</b> {p.future}</div>
                        </div>
                      </details>
                      {p.video && <div className="mt-3"><VideoCard id={p.id} url={p.video.url} /></div>}
                    </article>
                  ))}
                </div>
              )}

              {poi.id === "studio" && (
                <div className="space-y-5">
                  <p className="text-slate-300">Two Blender pieces — both modeled, lit, animated and edited solo.</p>
                  {BLENDER_RENDERS.map((r) => (
                    <article key={r.id} className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-500/5 p-4">
                      <h4 className="text-base font-bold">{r.title}</h4>
                      <p className="mt-1 text-xs text-slate-300">{r.blurb}</p>
                      <div className="mt-3"><VideoCard id={r.id} url={r.url} /></div>
                    </article>
                  ))}
                  <p className="text-xs text-slate-400">More renders coming. A perfume product render and more lighting studies are in progress.</p>
                </div>
              )}

              {poi.id === "ai-lab" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-emerald-300">{AI_ROADMAP.title}</h3>
                  <p>{AI_ROADMAP.intro}</p>
                  <ul className="space-y-1.5">
                    {AI_ROADMAP.roadmap.map((r) => {
                      const tone = r.state === "doing" ? "bg-emerald-400" : r.state === "next" ? "bg-amber-400" : "bg-slate-500";
                      return (
                        <li key={r.label} className="flex items-center gap-3 text-sm">
                          <span className={`h-2 w-2 rounded-full ${tone}`} />
                          <span>{r.label}</span>
                          <span className="ml-auto text-[10px] uppercase tracking-widest text-slate-400">{r.state}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {poi.id === "arvr-lab" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-cyan-300">{ARVR.title}</h3>
                  <p>{ARVR.body}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border border-cyan-400/20 bg-cyan-500/5 p-3"><b>AR</b><div className="text-xs text-slate-300">Completed training</div></div>
                    <div className="rounded border border-cyan-400/20 bg-cyan-500/5 p-3"><b>VR</b><div className="text-xs text-slate-300">Wrapping up · active dev next</div></div>
                  </div>
                </div>
              )}

              {poi.id === "arena" && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-lime-300">Off the keyboard</h3>
                  <p>I&apos;ve been playing cricket since I was 5. It&apos;s where I learned that the best things take repetition, patience and a calm head — habits I bring straight into building games.</p>
                  <p className="text-slate-300">Outside of code, I&apos;m a quiet, curious person. I notice details, I take my time, I finish things.</p>
                </div>
              )}

              {poi.id === "dungeon" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-red-300">Dungeon Adventure</h3>
                  <p>A short combat mini-game. Use the arrow keys to dodge waves of slimes; survive 60 seconds.</p>
                  <button
                    onClick={() => openMG("dungeon")}
                    className="rounded-md bg-red-500 px-5 py-2 font-bold text-white hover:bg-red-400"
                  >
                    Enter the Dungeon
                  </button>
                </div>
              )}

              {poi.id === "parkour" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-pink-300">Sky Parkour</h3>
                  <p>A timed parkour challenge — click stones in order before the timer hits zero.</p>
                  <button
                    onClick={() => openMG("parkour")}
                    className="rounded-md bg-pink-500 px-5 py-2 font-bold text-white hover:bg-pink-400"
                  >
                    Start Parkour
                  </button>
                </div>
              )}

              {poi.id === "observatory" && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-indigo-300">Vision</h3>
                  <p>{PROFILE.mission}</p>
                  <p className="text-slate-300">Game development isn&apos;t just my career goal — it&apos;s the medium I want to use to combine everything I love: programming, storytelling, art, AI, and immersive technology.</p>
                </div>
              )}

              {poi.id === "campfire" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-amber-300">Let&apos;s talk</h3>
                  <p>I&apos;m always open to learning, collaborating, or just having a chat about game dev.</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <a className="rounded-md border border-white/15 bg-white/5 px-4 py-3 hover:bg-white/10" href={`mailto:${PROFILE.contact.email}`}>
                      <div className="text-[10px] uppercase tracking-widest text-amber-300/80">Email</div>
                      <div className="text-sm">{PROFILE.contact.email}</div>
                    </a>
                    <a className="rounded-md border border-white/15 bg-white/5 px-4 py-3 hover:bg-white/10" href={PROFILE.contact.linkedin} target="_blank" rel="noreferrer">
                      <div className="text-[10px] uppercase tracking-widest text-amber-300/80">LinkedIn</div>
                      <div className="text-sm">/in/tarith-vetcha</div>
                    </a>
                    <div className="rounded-md border border-white/15 bg-white/5 px-4 py-3 sm:col-span-2">
                      <div className="text-[10px] uppercase tracking-widest text-amber-300/80">GitHub</div>
                      <div className="text-sm text-slate-300">{PROFILE.contact.github}</div>
                    </div>
                  </div>
                </div>
              )}

              {poi.id === "summit" && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white">You made it to the top.</h3>
                  <p>The cinematic begins in a moment&hellip;</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
