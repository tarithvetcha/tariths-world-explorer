import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/game/components/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tarithcraft — A voxel portfolio adventure by Tarith Vetcha" },
      { name: "description", content: "Explore a handcrafted voxel world that doubles as Tarith Vetcha's portfolio — game projects, Unreal Engine training, Blender renders, AI roadmap, and more." },
      { property: "og:title", content: "Tarithcraft — A voxel portfolio adventure" },
      { property: "og:description", content: "An indie voxel adventure that happens to be a portfolio. Built with React, Three.js, and a lot of love." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Game />;
}
