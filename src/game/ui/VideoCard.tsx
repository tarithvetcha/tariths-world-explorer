/**
 * Inline video card. Marks the video as "watched" the first time the user hits play.
 */
import { useRef } from "react";
import { useGame } from "../store";

export function VideoCard({ id, url }: { id: string; url: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const mark = useGame((s) => s.watchVideo);
  return (
    <div className="overflow-hidden rounded-md border border-white/15 bg-black">
      <video
        ref={ref}
        src={url}
        controls
        playsInline
        preload="metadata"
        onPlay={() => mark(id)}
        className="aspect-video w-full bg-black"
      />
    </div>
  );
}
