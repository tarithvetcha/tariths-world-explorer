/**
 * Handcrafted POI layout. Positions are world-space coordinates on the voxel terrain.
 * Each POI has a marker pillar + light beacon in the world and opens a panel when interacted.
 */
import type { POIId } from "../store";

export interface POI {
  id: POIId;
  name: string;
  subtitle: string;
  position: [number, number, number];
  color: string;
}

export const POIS: POI[] = [
  { id: "spawn", name: "Spawn Plaza", subtitle: "Welcome", position: [0, 0, 0], color: "#fef3c7" },
  { id: "village", name: "Home Village", subtitle: "About Me", position: [-18, 0, -10], color: "#fbbf24" },
  { id: "workshop", name: "Unreal Workshop", subtitle: "Experience & Training", position: [22, 0, -8], color: "#f97316" },
  { id: "library", name: "Project Library", subtitle: "Game Projects", position: [-8, 0, 26], color: "#3b82f6" },
  { id: "studio", name: "Render Studio", subtitle: "Blender Showcase", position: [-32, 0, 14], color: "#a855f7" },
  { id: "ai-lab", name: "AI Research Lab", subtitle: "AI / ML Journey", position: [34, 0, 22], color: "#10b981" },
  { id: "arvr-lab", name: "AR/VR Lab", subtitle: "Immersive Tech", position: [12, 0, 36], color: "#06b6d4" },
  { id: "arena", name: "Cricket Pitch", subtitle: "Personal", position: [-26, 0, -28], color: "#84cc16" },
  { id: "dungeon", name: "Dungeon Entrance", subtitle: "Mini-Game", position: [40, 0, -28], color: "#dc2626" },
  { id: "parkour", name: "Sky Parkour", subtitle: "Mini-Game", position: [-40, 0, 36], color: "#ec4899" },
  { id: "campfire", name: "Campfire", subtitle: "Contact", position: [0, 0, -34], color: "#f59e0b" },
  { id: "observatory", name: "Observatory", subtitle: "Vision & Mission", position: [28, 0, 48], color: "#6366f1" },
  { id: "summit", name: "Mountain Summit", subtitle: "The Finale", position: [-50, 18, -50], color: "#ffffff" },
];

export const POI_BY_ID: Record<string, POI> = Object.fromEntries(POIS.map((p) => [p.id, p]));
