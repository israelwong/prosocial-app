"use client";

import { useEffect } from "react";

function VideoPlayer({
  src,
  autoPlay = true,
  muted = true,
  loop = true,
  poster = "",
  controls = false,
}) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => video.play());
    }
  }, []);

  return (
    <video
      className="md:max-w-full mx-auto w-full  -z-10"
      preload="auto"
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      poster={poster}
      controls={controls}
    >
      <source src={src} />
      Tu navegador no soporta el elemento de video.
    </video>
  );
}

export default VideoPlayer;
