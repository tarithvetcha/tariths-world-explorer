/**
 * Voxel world geometry. Built once at mount using THREE.InstancedMesh for performance.
 * Terrain: handcrafted height function with biomes around POIs (grass, sand, stone, snow).
 * Structures: small voxel buildings/markers near each POI.
 */
import { useMemo } from "react";
import * as THREE from "three";
import type {} from "@react-three/fiber"; // brings JSX intrinsics for <mesh/>, <group/>, etc.
import { POIS } from "../data/locations";

const WORLD_RADIUS = 60;

// Stable height function — deterministic, no per-frame work.
export function heightAt(x: number, z: number): number {
  // Base rolling terrain
  const base =
    Math.sin(x * 0.12) * 0.6 +
    Math.cos(z * 0.1) * 0.5 +
    Math.sin((x + z) * 0.07) * 0.8;
  // Mountain near the summit corner
  const mx = x + 50;
  const mz = z + 50;
  const distMtn = Math.sqrt(mx * mx + mz * mz);
  const mountain = Math.max(0, 22 - distMtn * 0.7);
  // River carved through middle (lower around z=0 strip when x in range)
  const river = Math.abs(z) < 3 && x > -10 && x < 10 ? -2 : 0;
  return Math.floor(base + mountain + river);
}

function biomeAt(x: number, z: number, h: number): "grass" | "sand" | "stone" | "snow" | "water" | "path" {
  if (h <= -1) return "water";
  if (h >= 14) return "snow";
  if (h >= 8) return "stone";
  // Sandy ring near river
  if (Math.abs(z) < 5 && x > -12 && x < 12 && h <= 0) return "sand";
  // Stone paths radiating from spawn to POIs
  for (const p of POIS) {
    if (p.id === "summit") continue;
    const dx = p.position[0] - x;
    const dz = p.position[2] - z;
    const len = Math.sqrt(p.position[0] ** 2 + p.position[2] ** 2);
    if (len < 0.001) continue;
    // Distance from point (x,z) to line from origin to POI
    const t = (x * p.position[0] + z * p.position[2]) / (len * len);
    if (t > 0 && t < 1) {
      const px = p.position[0] * t;
      const pz = p.position[2] * t;
      const d = Math.sqrt((x - px) ** 2 + (z - pz) ** 2);
      if (d < 0.8) return "path";
    }
  }
  return "grass";
}

const COLORS: Record<string, string> = {
  grass: "#4ade80",
  grassDark: "#16a34a",
  sand: "#fde68a",
  stone: "#9ca3af",
  snow: "#f8fafc",
  water: "#3b82f6",
  path: "#d6d3d1",
  dirt: "#92400e",
  wood: "#7c2d12",
  leaves: "#22c55e",
  log: "#451a03",
};

interface Block {
  pos: [number, number, number];
  color: string;
}

export function buildWorld(): { blocks: Block[]; waterTiles: Array<[number, number]> } {
  const blocks: Block[] = [];
  const waterTiles: Array<[number, number]> = [];
  for (let x = -WORLD_RADIUS; x <= WORLD_RADIUS; x++) {
    for (let z = -WORLD_RADIUS; z <= WORLD_RADIUS; z++) {
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > WORLD_RADIUS) continue;
      const h = heightAt(x, z);
      const biome = biomeAt(x, z, h);

      if (biome === "water") {
        waterTiles.push([x, z]);
        // Underwater dirt
        blocks.push({ pos: [x, h, z], color: COLORS.sand });
        continue;
      }

      const top = biome === "grass" ? COLORS.grass : COLORS[biome] ?? COLORS.grass;
      blocks.push({ pos: [x, h, z], color: top });
      // A couple of dirt blocks beneath for visual depth on slopes
      for (let dy = 1; dy <= 2; dy++) {
        blocks.push({ pos: [x, h - dy, z], color: biome === "stone" || biome === "snow" ? COLORS.stone : COLORS.dirt });
      }
    }
  }

  // Trees scattered in grass biomes
  const treeRng = mulberry32(42);
  for (let i = 0; i < 80; i++) {
    const x = Math.floor((treeRng() - 0.5) * WORLD_RADIUS * 2);
    const z = Math.floor((treeRng() - 0.5) * WORLD_RADIUS * 2);
    if (Math.sqrt(x * x + z * z) > WORLD_RADIUS - 4) continue;
    const h = heightAt(x, z);
    const biome = biomeAt(x, z, h);
    if (biome !== "grass") continue;
    // Don't drop trees on top of POIs
    if (POIS.some((p) => Math.abs(p.position[0] - x) < 4 && Math.abs(p.position[2] - z) < 4)) continue;
    const trunkH = 3 + Math.floor(treeRng() * 2);
    for (let y = 1; y <= trunkH; y++) blocks.push({ pos: [x, h + y, z], color: COLORS.log });
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = 0; dy <= 2; dy++) {
          const dist = Math.abs(dx) + Math.abs(dz) + Math.abs(dy);
          if (dist > 3) continue;
          blocks.push({ pos: [x + dx, h + trunkH + dy, z + dz], color: COLORS.leaves });
        }
      }
    }
  }

  // Marker pillars at each POI (color-coded beacons)
  for (const p of POIS) {
    if (p.id === "summit") continue; // summit lives on the mountain naturally
    const h = heightAt(p.position[0], p.position[2]);
    for (let y = 1; y <= 4; y++) {
      blocks.push({ pos: [p.position[0], h + y, p.position[2]], color: p.color });
    }
    // Build a small voxel structure footprint
    buildStructure(blocks, p.id, p.position[0], h + 1, p.position[2]);
  }

  return { blocks, waterTiles };
}

function buildStructure(blocks: Block[], id: string, cx: number, cy: number, cz: number) {
  const add = (x: number, y: number, z: number, c: string) =>
    blocks.push({ pos: [cx + x, cy + y, cz + z], color: c });

  switch (id) {
    case "village": {
      // Small hut
      for (let x = -2; x <= 2; x++)
        for (let z = -2; z <= 2; z++) add(x, 0, z, COLORS.wood);
      for (let y = 1; y <= 3; y++) {
        add(-2, y, -2, COLORS.log); add(2, y, -2, COLORS.log);
        add(-2, y, 2, COLORS.log); add(2, y, 2, COLORS.log);
      }
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) add(x, 4, z, COLORS.leaves);
      }
      break;
    }
    case "workshop": {
      // Industrial-ish stone box
      for (let x = -3; x <= 3; x++)
        for (let z = -2; z <= 2; z++) {
          add(x, 0, z, COLORS.stone);
          if (Math.abs(x) === 3 || Math.abs(z) === 2) {
            for (let y = 1; y <= 3; y++) add(x, y, z, COLORS.stone);
          }
        }
      for (let x = -3; x <= 3; x++) for (let z = -2; z <= 2; z++) add(x, 4, z, "#1f2937");
      break;
    }
    case "library": {
      for (let x = -2; x <= 2; x++)
        for (let z = -2; z <= 2; z++) add(x, 0, z, "#1e3a8a");
      for (let y = 1; y <= 4; y++) {
        for (let x = -2; x <= 2; x++) { add(x, y, -2, "#1d4ed8"); add(x, y, 2, "#1d4ed8"); }
        for (let z = -2; z <= 2; z++) { add(-2, y, z, "#1d4ed8"); add(2, y, z, "#1d4ed8"); }
      }
      for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) add(x, 5, z, "#172554");
      break;
    }
    case "studio": {
      for (let x = -3; x <= 3; x++)
        for (let z = -3; z <= 3; z++) add(x, 0, z, "#581c87");
      for (let y = 1; y <= 5; y++) for (let x = -3; x <= 3; x++) {
        add(x, y, -3, "#6b21a8"); add(x, y, 3, "#6b21a8");
      }
      for (let y = 1; y <= 5; y++) for (let z = -3; z <= 3; z++) {
        add(-3, y, z, "#6b21a8"); add(3, y, z, "#6b21a8");
      }
      break;
    }
    case "ai-lab":
    case "arvr-lab": {
      const c1 = id === "ai-lab" ? "#064e3b" : "#164e63";
      const c2 = id === "ai-lab" ? "#10b981" : "#06b6d4";
      for (let x = -2; x <= 2; x++)
        for (let z = -2; z <= 2; z++) add(x, 0, z, c1);
      for (let y = 1; y <= 3; y++) for (let x = -2; x <= 2; x++) {
        add(x, y, -2, c2); add(x, y, 2, c2);
      }
      for (let y = 1; y <= 3; y++) for (let z = -2; z <= 2; z++) {
        add(-2, y, z, c2); add(2, y, z, c2);
      }
      add(0, 4, 0, c2);
      break;
    }
    case "arena": {
      // cricket pitch
      for (let x = -4; x <= 4; x++) for (let z = -2; z <= 2; z++) add(x, 0, z, "#a3e635");
      add(-3, 1, 0, "#fafafa"); add(3, 1, 0, "#fafafa");
      break;
    }
    case "dungeon": {
      for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) add(x, 0, z, "#1c1917");
      for (let y = 1; y <= 4; y++) {
        add(-2, y, -2, "#7f1d1d"); add(2, y, -2, "#7f1d1d");
        add(-2, y, 2, "#7f1d1d"); add(2, y, 2, "#7f1d1d");
      }
      add(0, 1, -2, "#000"); add(0, 2, -2, "#000");
      break;
    }
    case "parkour": {
      // floating platforms above
      for (let i = 0; i < 6; i++) {
        for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++)
          add(x + i * 2, 3 + i, z + i, "#ec4899");
      }
      break;
    }
    case "campfire": {
      for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) add(x, 0, z, "#78350f");
      add(0, 1, 0, "#f97316"); add(0, 2, 0, "#fbbf24");
      break;
    }
    case "observatory": {
      for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) add(x, 0, z, "#312e81");
      for (let y = 1; y <= 5; y++) add(0, y, 0, "#4338ca");
      add(0, 6, 0, "#a5b4fc");
      break;
    }
  }
}

// Deterministic small PRNG
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// React component renders the world as a single InstancedMesh per color group.
export function VoxelWorld() {
  const data = useMemo(() => buildWorld(), []);

  // Group blocks by color → one InstancedMesh per color (fast & batched).
  const groups = useMemo(() => {
    const map = new Map<string, Block[]>();
    for (const b of data.blocks) {
      const arr = map.get(b.color) ?? [];
      arr.push(b);
      map.set(b.color, arr);
    }
    return Array.from(map.entries());
  }, [data]);

  return (
    <group>
      {groups.map(([color, list]) => (
        <InstancedBlocks key={color} color={color} blocks={list} />
      ))}
      {/* Water as a translucent plane covering river area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <planeGeometry args={[24, 120]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.75} roughness={0.15} metalness={0.1} />
      </mesh>
    </group>
  );
}

function InstancedBlocks({ color, blocks }: { color: string; blocks: Block[] }) {
  const ref = useMemoInstanced(blocks);
  return (
    <instancedMesh ref={ref.meshRef} args={[undefined, undefined, blocks.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial color={color} />
    </instancedMesh>
  );
}

function useMemoInstanced(blocks: Block[]) {
  const meshRef = useMemo(() => ({ current: null as THREE.InstancedMesh | null }), []);
  // Set matrices once when the mesh mounts.
  const setup = (mesh: THREE.InstancedMesh | null) => {
    meshRef.current = mesh;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < blocks.length; i++) {
      const [x, y, z] = blocks[i].pos;
      m.setPosition(x, y, z);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  return { meshRef: setup };
}

// Public helper: walkable ground height at world coords (player physics).
export function groundAt(x: number, z: number): number {
  // Snap to integer grid and use heightAt; +1 because top of block at h sits at y = h+0.5.
  const ix = Math.round(x);
  const iz = Math.round(z);
  const h = heightAt(ix, iz);
  return h + 0.5; // top surface y
}
