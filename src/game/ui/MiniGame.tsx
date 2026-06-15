/**
 * Two lightweight 2D mini-games rendered on a canvas inside an overlay.
 * - Dungeon: dodge slimes for 60s.
 * - Parkour: click stones in order before the timer runs out.
 */
import { useEffect, useRef, useState } from "react";
import { useGame } from "../store";

export function MiniGame() {
  const active = useGame((s) => s.miniGame);
  const close = useGame((s) => s.closeMiniGame);

  if (!active) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-white/15 bg-[#0b1023] p-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-widest text-amber-300">
            {active === "dungeon" ? "Dungeon Adventure" : "Sky Parkour"}
          </div>
          <button onClick={close} className="rounded border border-white/20 px-3 py-1 text-xs hover:bg-white/10">Close</button>
        </div>
        {active === "dungeon" ? <DungeonGame /> : <ParkourGame />}
      </div>
    </div>
  );
}

/** Dungeon: top-down arena, dodge slimes for 60s. Arrow keys / WASD. */
function DungeonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [state, setState] = useState<"play" | "won" | "lost">("play");
  const unlock = useGame((s) => s.unlockAchievement);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const keys = new Set<string>();
    const onK = (e: KeyboardEvent, d: boolean) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","KeyW","KeyA","KeyS","KeyD"].includes(e.code)) {
        e.preventDefault();
        d ? keys.add(e.code) : keys.delete(e.code);
      }
    };
    const kd = (e: KeyboardEvent) => onK(e, true);
    const ku = (e: KeyboardEvent) => onK(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    const player = { x: W / 2, y: H / 2, r: 10 };
    const slimes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    let last = performance.now();
    let elapsed = 0;
    let raf = 0;
    let alive = true;

    const spawn = () => {
      const side = Math.floor(Math.random() * 4);
      const r = 8 + Math.random() * 8;
      const speed = 50 + Math.random() * 50 + elapsed * 1.5;
      const a = Math.random() * Math.PI * 2;
      let x = 0, y = 0;
      if (side === 0) { x = -r; y = Math.random() * H; }
      else if (side === 1) { x = W + r; y = Math.random() * H; }
      else if (side === 2) { y = -r; x = Math.random() * W; }
      else { y = H + r; x = Math.random() * W; }
      const dx = player.x - x, dy = player.y - y;
      const len = Math.hypot(dx, dy) || 1;
      slimes.push({ x, y, vx: (dx / len) * speed + Math.cos(a) * 20, vy: (dy / len) * speed + Math.sin(a) * 20, r });
    };

    let spawnTimer = 0;

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!alive) return;
      elapsed += dt;
      spawnTimer -= dt;
      if (spawnTimer <= 0) { spawn(); spawnTimer = Math.max(0.15, 0.8 - elapsed * 0.01); }

      const sp = 180;
      if (keys.has("ArrowUp") || keys.has("KeyW")) player.y -= sp * dt;
      if (keys.has("ArrowDown") || keys.has("KeyS")) player.y += sp * dt;
      if (keys.has("ArrowLeft") || keys.has("KeyA")) player.x -= sp * dt;
      if (keys.has("ArrowRight") || keys.has("KeyD")) player.x += sp * dt;
      player.x = Math.max(player.r, Math.min(W - player.r, player.x));
      player.y = Math.max(player.r, Math.min(H - player.r, player.y));

      for (const s of slimes) { s.x += s.vx * dt; s.y += s.vy * dt; }

      // Collisions
      for (const s of slimes) {
        if (Math.hypot(s.x - player.x, s.y - player.y) < s.r + player.r) {
          alive = false; setState("lost"); cancelAnimationFrame(raf); return;
        }
      }

      ctx.fillStyle = "#0b1023"; ctx.fillRect(0, 0, W, H);
      // Grid
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 24) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
      for (let j = 0; j < H; j += 24) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke(); }

      // Slimes
      for (const s of slimes) {
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
      }
      // Player
      ctx.fillStyle = "#facc15";
      ctx.fillRect(player.x - player.r, player.y - player.r, player.r * 2, player.r * 2);

      // Score & timer
      ctx.fillStyle = "#fff";
      ctx.font = "14px monospace";
      ctx.fillText(`Survive: ${Math.max(0, 60 - Math.floor(elapsed))}s`, 10, 20);
      setScore(Math.floor(elapsed));

      if (elapsed >= 60) { alive = false; setState("won"); unlock("dungeon-clear"); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, [unlock]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={500} height={340} className="rounded border border-white/20 bg-black" />
      <div className="text-xs text-slate-300">
        {state === "play" && <>Arrows / WASD — dodge red slimes · {score}s</>}
        {state === "lost" && <span className="text-red-300">You were caught! Press Close, then re-enter to retry.</span>}
        {state === "won" && <span className="text-emerald-300">Cleared! Achievement unlocked.</span>}
      </div>
    </div>
  );
}

/** Parkour: click the platforms in order before the timer runs out. */
function ParkourGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"play" | "won" | "lost">("play");
  const [step, setStep] = useState(0);
  const [time, setTime] = useState(20);
  const unlock = useGame((s) => s.unlockAchievement);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const targets = Array.from({ length: 10 }).map((_, i) => ({
      x: 40 + Math.random() * (W - 80),
      y: 40 + Math.random() * (H - 80),
      r: 22,
      i,
    }));
    let alive = true;
    let elapsed = 0;
    let raf = 0;
    let last = performance.now();
    let current = 0;

    const click = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const my = (e.clientY - rect.top) * (H / rect.height);
      const t = targets[current];
      if (!t) return;
      if (Math.hypot(mx - t.x, my - t.y) < t.r) {
        current++;
        setStep(current);
        if (current >= targets.length) { alive = false; setState("won"); unlock("parkour-clear"); cancelAnimationFrame(raf); }
      }
    };
    canvas.addEventListener("click", click);

    const tick = (t: number) => {
      if (!alive) return;
      const dt = (t - last) / 1000; last = t; elapsed += dt;
      const remaining = 20 - elapsed;
      setTime(Math.max(0, remaining));
      if (remaining <= 0) { alive = false; setState("lost"); return; }

      ctx.fillStyle = "#0b1023"; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        const done = i < current;
        const isNext = i === current;
        ctx.fillStyle = done ? "#10b981" : isNext ? "#ec4899" : "#475569";
        ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "bold 14px monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), t.x, t.y);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); canvas.removeEventListener("click", click); };
  }, [unlock]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={500} height={340} className="rounded border border-white/20 bg-black cursor-crosshair" />
      <div className="text-xs text-slate-300">
        {state === "play" && <>Click 1 → 10 in order · {step}/10 · {time.toFixed(1)}s left</>}
        {state === "won" && <span className="text-emerald-300">Cleared! Achievement unlocked.</span>}
        {state === "lost" && <span className="text-red-300">Out of time! Close and retry.</span>}
      </div>
    </div>
  );
}
