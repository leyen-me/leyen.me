"use client";

import MusicIsland from "./island";

/**
 * Gallery shell for the music island. The block is shown in its default black
 * tone at the default bounce; the gallery's own page background provides the
 * surrounding surface.
 */
export default function Demo() {
  return (
    <div className="mi-stage w-full max-w-[340px]">
      <MusicIsland tone="Black" startOpen />
    </div>
  );
}
