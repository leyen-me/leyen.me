/**
 * Flight Booking Hero — ported from Aceternity UI's Flight Booking Hero
 * Section on the Cloud Shader page.
 * Source: https://ui.aceternity.com/components/cloud-shader
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the drifting cloud shader background at half
 * resolution, the Skyline navbar, the headline and supporting copy, the
 * "Book a flight" and "Explore destinations" actions, the traveller social
 * proof, and the window-seat wing image with its slow in-flight bob.
 * Changed for the gallery: `motion/react` fades are plain CSS animations that
 * stop under reduced motion, and the wing and avatars are bundled locally.
 *
 * The hero always uses the original daylight palette, even when the gallery is
 * in dark mode: it owns its full-bleed sky background, and the bright look is
 * the intended design.
 */

import { CloudShader, type CloudPalette } from "./CloudShader";
import avatar1 from "./assets/avatar-1.webp";
import avatar2 from "./assets/avatar-2.webp";
import avatar3 from "./assets/avatar-3.webp";
import avatar4 from "./assets/avatar-4.webp";
import avatar5 from "./assets/avatar-5.webp";
import planeWing from "./assets/plane-wing.webp";

/** Daylight sky from the original demo. */
const PALETTE: CloudPalette = {
  cloud: "#fbf8f2",
  skyTop: "#3876ba",
  skyBottom: "#8cbfe8",
};

const TRAVELLERS = [
  { src: avatar1, alt: "Traveller 1" },
  { src: avatar2, alt: "Traveller 2" },
  { src: avatar3, alt: "Traveller 3" },
  { src: avatar4, alt: "Traveller 4" },
  { src: avatar5, alt: "Traveller 5" },
];

export default function Demo() {
  return (
    <section
      className="relative flex h-full min-h-[600px] w-full flex-col overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to top, ${PALETTE.skyBottom}, ${PALETTE.skyTop})`,
      }}
    >
      <style>{`
        @keyframes flight-sky-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes flight-wing-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .flight-sky-in { animation: flight-sky-in 1.4s ease-out both; }
        .flight-wing-bob { animation: flight-wing-bob 8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .flight-sky-in, .flight-wing-bob { animation: none; }
        }
      `}</style>

      {/* The shader renders at half size and upscales 2x: clouds are soft, so
          nothing visible is lost and the GPU does a quarter of the work. */}
      <div className="flight-sky-in absolute inset-0">
        <div className="absolute h-1/2 w-1/2 origin-top-left scale-[2]">
          <CloudShader palette={PALETTE} />
        </div>
      </div>

      {/* navbar */}
      <nav className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-6 md:px-8">
        <div className="flex items-center gap-10">
          <span className="text-lg font-semibold tracking-tight text-white">
            Skyline
          </span>
          <div className="hidden items-center gap-8 text-sm font-medium text-white/90 md:flex">
            <a className="rounded-sm transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80" href="#">
              Flights
            </a>
            <a className="rounded-sm transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80" href="#">
              Hotels
            </a>
            <a className="rounded-sm transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80" href="#">
              Deals
            </a>
            <a className="rounded-sm transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80" href="#">
              Support
            </a>
          </div>
        </div>
        <a
          className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#3876ba]"
          href="#"
        >
          Sign in
        </a>
      </nav>

      {/* hero content, left aligned with the navbar */}
      <div className="relative z-20 mx-auto mt-16 w-full max-w-7xl px-4 md:mt-24 md:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            Your window seat to anywhere on Earth
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 md:text-lg">
            Search 400+ airlines, watch fares drop in real time, and book in
            under a minute. No hidden fees, no fine print, just you and the
            clouds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#3876ba]"
              href="#"
            >
              Book a flight
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              href="#"
            >
              Explore destinations
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          {/* social proof */}
          <div className="mt-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex -space-x-2.5">
              {TRAVELLERS.map((traveller) => (
                // eslint-disable-next-line @next/next/no-img-element -- bundled source asset
                <img
                  alt={traveller.alt}
                  className="h-8 w-8 rounded-full border-2 border-white/80 object-cover"
                  height={32}
                  key={traveller.alt}
                  src={traveller.src.src}
                  width={32}
                />
              ))}
            </div>
            <p className="text-sm text-white/90">
              <span className="font-semibold text-white">Manu</span> and 5 others
              saved 30% on their last trip
            </p>
          </div>
        </div>
      </div>

      {/* window-seat wing view with a gentle in-flight bob */}
      <div className="flight-wing-bob pointer-events-none absolute -bottom-10 left-0 z-10 w-[68%] sm:w-[46%] md:w-[36%]">
        {/* eslint-disable-next-line @next/next/no-img-element -- bundled source asset */}
        <img
          alt="Airplane wing above the clouds"
          className="h-auto w-full object-cover"
          height={planeWing.height}
          src={planeWing.src}
          width={planeWing.width}
        />
      </div>
    </section>
  );
}
