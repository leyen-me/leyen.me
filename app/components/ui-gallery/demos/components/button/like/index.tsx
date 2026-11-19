"use client";

import { useState, type CSSProperties } from "react";
import { LikeBurst, type BurstEffect } from "./burst";
import { HeartIcon } from "./heart";
import { LIKE_CSS } from "./like-css";
import { Odometer } from "./odometer";
import { playLikeSound } from "./sound";

/**
 * Faithful port of Bencho's "Like" press block (defaults: 1,300 likes, Bloom
 * burst at 50, red heart, 22 px corner). Everything is local: the heart path,
 * the odometer, the particle geometry and a Web Audio copy of `pop` / `tock`.
 */
const START = 1300;
const BURST = 0.5;
const EFFECT: BurstEffect = "Bloom";

export default function Demo() {
  const [liked, setLiked] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const count = START + (liked ? 1 : 0);

  function handleClick() {
    const next = !liked;
    setLiked(next);

    if (next) {
      setBurstKey((key) => key + 1);
      playLikeSound("pop");
    } else {
      playLikeSound("tock");
    }
  }

  return (
    <div className="like-demo w-[240px] max-w-full">
      <style>{LIKE_CSS}</style>

      <div className="grid h-[130px] w-full place-items-center">
        <button
          type="button"
          aria-pressed={liked}
          aria-label={`${liked ? "Unlike" : "Like"}. ${count.toLocaleString("en-US")} likes`}
          onClick={handleClick}
          className="like-button flex h-11 items-center gap-2 rounded-full bg-surface-0 pl-4 pr-5 text-base font-medium tracking-[-0.01em] text-[#17181a] transition duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] [-webkit-tap-highlight-color:transparent] hover:bg-surface-1 active:scale-[0.96] dark:text-white"
        >
          <span className="relative grid h-5 w-5 place-items-center">
            <span
              key={liked ? "on" : "off"}
              className={`relative z-[1] grid ${
                liked
                  ? EFFECT === "Bloom"
                    ? "like-glyph-on text-[#e5484d]"
                    : "like-glyph-pop text-[#e5484d]"
                  : ""
              }`}
            >
              <HeartIcon filled={liked} />
            </span>

            {liked && BURST > 0 ? (
              <span
                key={burstKey}
                aria-hidden="true"
                className="like-burst pointer-events-none absolute left-1/2 top-1/2"
                style={{ "--fly": BURST } as CSSProperties}
              >
                <LikeBurst effect={EFFECT} fly={BURST} />
              </span>
            ) : null}
          </span>

          <Odometer value={count} up={liked} />
        </button>
      </div>
    </div>
  );
}
