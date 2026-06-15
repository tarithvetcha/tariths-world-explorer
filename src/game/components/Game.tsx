/**
 * Top-level Game wrapper. Mounts canvas + all UI layers + global keyboard input.
 */
import { useEffect } from "react";
import { Scene } from "./Scene";
import { useInput } from "../hooks/useInput";
import { MainMenu } from "../ui/MainMenu";
import { HUD } from "../ui/HUD";
import { POIPanel } from "../ui/POIPanel";
import { MiniGame } from "../ui/MiniGame";
import { AchievementToasts } from "../ui/AchievementToasts";
import { Credits } from "../ui/Credits";
import { useGame } from "../store";

export function Game() {
  const input = useInput();
  const started = useGame((s) => s.started);

  // Lock page scroll while in-game
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black select-none">
      <Scene input={input} />
      {started && <HUD />}
      {started && <POIPanel />}
      {started && <MiniGame />}
      {started && <AchievementToasts />}
      {started && <Credits />}
      {!started && <MainMenu />}
    </div>
  );
}
