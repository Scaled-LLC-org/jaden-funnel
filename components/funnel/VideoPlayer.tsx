"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";

/** Client island — poster thumbnail that swaps to a YouTube embed on click. */
export function VideoPlayer({
  poster,
  youtubeId,
  ratio = "16/9",
}: {
  poster: string;
  youtubeId?: string;
  ratio?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      onClick={() => { if (youtubeId) { logger.info("video_play", { youtubeId }); setPlaying(true); } }}
      className="am-vid"
      style={{ aspectRatio: ratio, cursor: youtubeId ? "pointer" : "default" }}
    >
      {playing && youtubeId ? (
        <iframe
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="am-vid-play">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </>
      )}
    </div>
  );
}
