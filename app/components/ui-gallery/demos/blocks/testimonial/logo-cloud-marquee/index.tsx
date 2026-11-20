/**
 * Logo Cloud Marquee — ported from Aceternity UI's Logo Cloud Marquee block.
 * Source: https://ui.aceternity.com/blocks/logo-clouds/logo-cloud-marquee
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the gradient "Brands love us" headline and its
 * supporting line, the two logo rows running in opposite directions at 50px/s
 * and 30px/s, pause-on-hover, the edge fade mask, and the four bundled brand
 * marks (inverted in dark mode).
 * Changed for the gallery: the upstream react-fast-marquee wrapper is replaced
 * with a CSS keyframe track that stops under reduced motion, and the section
 * fills the ?fill=1 iframe instead of growing from its content.
 */

import type { CSSProperties } from "react";

import asteroidKit from "./assets/asteroid-kit.png";
import aceternityUi from "./assets/aceternity-ui.png";
import gamity from "./assets/gamity.png";
import hostit from "./assets/hostit.png";

/** Each row repeats the four marks twice, as the original 8-item set does. */
const LOGOS = [
  { src: aceternityUi, alt: "Aceternity UI" },
  { src: gamity, alt: "Gamity" },
  { src: hostit, alt: "Host it" },
  { src: asteroidKit, alt: "Asteroid Kit" },
  { src: aceternityUi, alt: "Aceternity UI 2" },
  { src: gamity, alt: "Gamity 2" },
  { src: hostit, alt: "Host it 2" },
  { src: asteroidKit, alt: "Asteroid Kit 2" },
];

function LogoRow({
  direction,
  duration,
  mobileDuration,
}: {
  direction: "normal" | "reverse";
  duration: string;
  mobileDuration: string;
}) {
  // The track holds two identical copies and slides by exactly half its width,
  // so the loop is seamless at any viewport width.
  const copy = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {LOGOS.map((logo) => (
        // eslint-disable-next-line @next/next/no-img-element -- bundled source asset
        <img
          alt={logo.alt}
          className="mx-0 w-32 object-contain filter md:mx-10 md:w-40 dark:invert"
          height={100}
          key={`${logo.alt}-${hidden ? "clone" : "original"}`}
          src={logo.src.src}
          width={100}
        />
      ))}
    </div>
  );

  return (
    <div className="logo-marquee-row group relative w-full max-w-7xl overflow-hidden">
      <div
        className="logo-marquee-track flex w-max"
        style={
          {
            "--logo-marquee-duration": duration,
            "--logo-marquee-mobile-duration": mobileDuration,
            "--logo-marquee-direction": direction,
          } as CSSProperties
        }
      >
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <section className="flex h-full min-h-[600px] w-full flex-col items-center justify-center overflow-hidden bg-white px-4 py-12 dark:bg-neutral-950 md:px-8">
      <style>{`
        @keyframes logo-marquee-scroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .logo-marquee-row {
          -webkit-mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
          mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
        }
        .logo-marquee-track {
          animation: logo-marquee-scroll linear infinite;
          animation-duration: var(--logo-marquee-duration);
          animation-direction: var(--logo-marquee-direction);
          will-change: transform;
        }
        .logo-marquee-row:hover .logo-marquee-track {
          animation-play-state: paused;
        }
        @media (max-width: 767px) {
          .logo-marquee-track {
            animation-duration: var(--logo-marquee-mobile-duration);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-marquee-track { animation: none; }
        }
      `}</style>

      <div className="relative z-20 w-full">
        <h2 className="bg-gradient-to-b from-neutral-900 to-neutral-600 bg-clip-text text-center text-2xl font-bold text-transparent md:text-5xl dark:from-white dark:to-neutral-600">
          Brands love us
        </h2>
        <p className="mt-4 text-center text-base text-neutral-700 dark:text-neutral-300">
          Aceternity UI is loved by the best companies who are serious about
          what they do.
        </p>

        <div className="mt-12 flex w-full flex-col items-center gap-4 md:mt-20 md:gap-20">
          <LogoRow
            direction="reverse"
            duration="38.4s"
            mobileDuration="20.5s"
          />
          <LogoRow direction="normal" duration="64s" mobileDuration="34.1s" />
        </div>
      </div>
    </section>
  );
}
