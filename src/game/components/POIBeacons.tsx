/**
 * Per-POI floating beacon (light + spinning glyph + soft particles).
 * Cheap: only meshes, no per-frame allocations.
 */
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { POIS } from "../data/locations";
import { groundAt } from "./World";
import { useGame } from "../store";

export function POIBeacons() {
  const groupRef = useRef<THREE.Group>(null);
  const nearby = useGame((s) => s.nearbyPOI);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    for (const child of groupRef.current.children) {
      child.rotation.y += dt * 0.6;
    }
  });

  return (
    <group ref={groupRef}>
      {POIS.map((p) => {
        const y = groundAt(p.position[0], p.position[2]) + 5.5;
        const isNearby = nearby === p.id;
        return (
          <group key={p.id} position={[p.position[0], y, p.position[2]]}>
            <mesh>
              <octahedronGeometry args={[0.45, 0]} />
              <meshStandardMaterial
                color={p.color}
                emissive={p.color}
                emissiveIntensity={isNearby ? 2.2 : 1.1}
                roughness={0.2}
              />
            </mesh>
            <pointLight color={p.color} intensity={isNearby ? 6 : 2.5} distance={12} />
          </group>
        );
      })}
    </group>
  );
}
