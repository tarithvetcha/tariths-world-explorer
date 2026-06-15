/**
 * Global game state — player position, UI panels, achievements, unlocked POIs.
 * Kept intentionally small so React renders stay cheap; per-frame data lives on refs.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type POIId =
  | "spawn"
  | "village"
  | "workshop"
  | "library"
  | "studio"
  | "ai-lab"
  | "arvr-lab"
  | "arena"
  | "dungeon"
  | "parkour"
  | "observatory"
  | "campfire"
  | "summit";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "diamond" | "legendary";
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", title: "First Steps", description: "Welcome to Tarithcraft.", tier: "bronze" },
  { id: "explorer", title: "Explorer", description: "Discover 5 locations.", tier: "silver" },
  { id: "lore-master", title: "Lore Master", description: "Discover every location.", tier: "gold" },
  { id: "dungeon-clear", title: "Dungeon Slayer", description: "Defeat the dungeon boss.", tier: "gold" },
  { id: "parkour-clear", title: "Sky Runner", description: "Clear the parkour course.", tier: "gold" },
  { id: "filmmaker", title: "Filmmaker", description: "Watch every Blender render.", tier: "silver" },
  { id: "summit", title: "Summit Reached", description: "Climb to the very top.", tier: "diamond" },
  { id: "ending", title: "The Adventure Begins", description: "Witness the final cinematic.", tier: "legendary" },
];

interface GameState {
  started: boolean;
  loaded: number; // 0..1
  activePOI: POIId | null;
  nearbyPOI: POIId | null;
  visitedPOIs: POIId[];
  achievements: string[];
  watchedVideos: string[];
  miniGame: "dungeon" | "parkour" | null;
  showCredits: boolean;
  timeOfDay: number; // 0..1 (0 = midnight, 0.5 = noon)
  paused: boolean;

  setStarted: (v: boolean) => void;
  setLoaded: (v: number) => void;
  setNearby: (id: POIId | null) => void;
  openPOI: (id: POIId) => void;
  closePOI: () => void;
  unlockAchievement: (id: string) => void;
  watchVideo: (id: string) => void;
  openMiniGame: (id: "dungeon" | "parkour") => void;
  closeMiniGame: () => void;
  setShowCredits: (v: boolean) => void;
  setTimeOfDay: (v: number) => void;
  setPaused: (v: boolean) => void;
  reset: () => void;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      started: false,
      loaded: 0,
      activePOI: null,
      nearbyPOI: null,
      visitedPOIs: [],
      achievements: [],
      watchedVideos: [],
      miniGame: null,
      showCredits: false,
      timeOfDay: 0.35,
      paused: false,

      setStarted: (v) => set({ started: v }),
      setLoaded: (v) => set({ loaded: v }),
      setNearby: (id) => set({ nearbyPOI: id }),
      openPOI: (id) => {
        const { visitedPOIs, unlockAchievement } = get();
        const visited = visitedPOIs.includes(id) ? visitedPOIs : [...visitedPOIs, id];
        set({ activePOI: id, visitedPOIs: visited, paused: true });
        if (visited.length === 1) unlockAchievement("first-step");
        if (visited.length >= 5) unlockAchievement("explorer");
        if (visited.length >= 11) unlockAchievement("lore-master");
        if (id === "summit") {
          unlockAchievement("summit");
          // Trigger final cinematic shortly after.
          setTimeout(() => set({ showCredits: true }), 1500);
        }
      },
      closePOI: () => set({ activePOI: null, paused: false }),
      unlockAchievement: (id) => {
        const { achievements } = get();
        if (achievements.includes(id)) return;
        set({ achievements: [...achievements, id] });
      },
      watchVideo: (id) => {
        const { watchedVideos, unlockAchievement } = get();
        if (watchedVideos.includes(id)) return;
        const next = [...watchedVideos, id];
        set({ watchedVideos: next });
        if (next.length >= 5) unlockAchievement("filmmaker");
      },
      openMiniGame: (id) => set({ miniGame: id, paused: true }),
      closeMiniGame: () => set({ miniGame: null, paused: false }),
      setShowCredits: (v) => {
        set({ showCredits: v });
        if (v) get().unlockAchievement("ending");
      },
      setTimeOfDay: (v) => set({ timeOfDay: v }),
      setPaused: (v) => set({ paused: v }),
      reset: () =>
        set({
          started: false,
          activePOI: null,
          visitedPOIs: [],
          achievements: [],
          watchedVideos: [],
          miniGame: null,
          showCredits: false,
        }),
    }),
    {
      name: "tarithcraft-save",
      partialize: (s) => ({
        visitedPOIs: s.visitedPOIs,
        achievements: s.achievements,
        watchedVideos: s.watchedVideos,
      }),
    },
  ),
);
