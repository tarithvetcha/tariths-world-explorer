/**
 * Main R3F canvas + scene composition. Pure orchestration; no logic.
 */
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { VoxelWorld } from "./World";
import { Player } from "./Player";
import { NPCTarith } from "./NPC";
import { SkyAndSun, SkyDome } from "./Sky";
import { POIBeacons } from "./POIBeacons";
import { Clouds, Fireflies } from "./Atmosphere";
import type { InputState } from "../hooks/useInput";

export function Scene({ input }: { input: React.MutableRefObject<InputState> }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 6, 12], fov: 70, near: 0.1, far: 400 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <fog attach="fog" args={["#cfe9ff", 60, 180]} />
        <SkyDome />
        <SkyAndSun />
        <VoxelWorld />
        <POIBeacons />
        <Clouds />
        <Fireflies />
        <NPCTarith />
        <Player input={input} />
      </Suspense>
    </Canvas>
  );
}
