/**
 * Tarith NPC — an autonomous voxel double that wanders between POIs,
 * waves when the player is close, and contributes to the "lived-in" feel.
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { TarithVoxel } from "./Player";
import { groundAt } from "./World";
import { POIS } from "../data/locations";
import { useGame } from "../store";

export function NPCTarith() {
  const ref = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const nearby = useGame((s) => s.nearbyPOI);

  // Pre-pick a wander loop through some calm POIs.
  const path = useMemo(
    () =>
      ["spawn", "village", "library", "studio", "campfire"]
        .map((id) => POIS.find((p) => p.id === id)!)
        .map((p) => new THREE.Vector3(p.position[0] + 2, 0, p.position[2] + 2)),
    [],
  );

  const state = useMemo(
    () => ({ idx: 0, t: 0, pos: path[0].clone() }),
    [path],
  );

  useFrame((_, dt) => {
    state.t += dt;
    const target = path[state.idx];
    const dir = new THREE.Vector2(target.x - state.pos.x, target.z - state.pos.z);
    const dist = dir.length();
    if (dist < 0.5) {
      state.idx = (state.idx + 1) % path.length;
    } else {
      dir.normalize();
      const speed = 1.8;
      state.pos.x += dir.x * speed * dt;
      state.pos.z += dir.y * speed * dt;
    }
    state.pos.y = groundAt(state.pos.x, state.pos.z);
    if (ref.current) {
      ref.current.position.copy(state.pos);
      ref.current.rotation.y = Math.atan2(dir.x, dir.y);
    }
    // Wave when the player is interacting with anything
    if (armRef.current) {
      armRef.current.rotation.z = nearby ? Math.sin(state.t * 8) * 0.6 - 0.4 : 0;
    }
  });

  return (
    <group ref={ref}>
      <TarithVoxel />
      {/* Floating name tag */}
      <mesh position={[0, 2.7, 0]}>
        <planeGeometry args={[2, 0.4]} />
        <meshBasicMaterial color="#000" transparent opacity={0.5} />
      </mesh>
      {/* Wave arm overlay */}
      <group ref={armRef} position={[0.55, 1.55, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.18, 0.6, 0.18]} />
          <meshLambertMaterial color="#0f172a" />
        </mesh>
      </group>
    </group>
  );
}
