/**
 * Spotlight — ported from Aceternity UI's component of the same name.
 * Source: https://ui.aceternity.com/components/spotlight
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the blurred ellipse SVG and its 2s / 0.75s ease
 * entrance, the 40px grid overlay, the centred "Spotlight is the new trend."
 * copy and its gradient headline.
 * Changed for the gallery: the section fills the ?fill=1 iframe, the grid and
 * spotlight follow the theme (dark ink on light, white on dark), the filter id
 * is demo-scoped, and reduced motion keeps the final glow without the entrance
 * movement.
 */

const SPOTLIGHT_CSS = `
@keyframes ui-spotlight-enter {
  0% { opacity: 0; transform: translate(-72%, -62%) scale(0.5); }
  100% { opacity: 1; transform: translate(-50%, -40%) scale(1); }
}
.ui-spotlight {
  animation: ui-spotlight-enter 2s ease 0.75s 1 forwards;
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .ui-spotlight {
    animation: none;
    opacity: 1;
    transform: translate(-50%, -40%);
  }
}
`;

const GRID =
  "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] [background-size:40px_40px]";

function Spotlight({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`ui-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] text-zinc-900 opacity-0 dark:text-white lg:w-[84%] ${className ?? ""}`}
      fill="none"
      viewBox="0 0 3787 2842"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#ui-spotlight-blur)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          fill="currentColor"
          fillOpacity="0.21"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
        />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="2840.26"
          id="ui-spotlight-blur"
          width="3785.16"
          x="0.860352"
          y="0.838989"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            in="SourceGraphic"
            in2="BackgroundImageFix"
            mode="normal"
            result="shape"
          />
          <feGaussianBlur
            result="ui-spotlight-glow"
            stdDeviation="151"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default function Demo() {
  return (
    <section className="relative flex h-full min-h-[600px] w-full items-center justify-center overflow-hidden bg-white antialiased dark:bg-[#0a0a0a]">
      <style>{SPOTLIGHT_CSS}</style>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 select-none ${GRID}`}
      />

      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 text-center">
        <h1 className="bg-gradient-to-b from-zinc-900 to-zinc-500 bg-clip-text text-balance text-4xl font-bold text-transparent dark:from-neutral-50 dark:to-neutral-400 md:text-7xl">
          Spotlight <br /> is the new trend.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-zinc-600 dark:text-neutral-300">
          Spotlight effect is a great way to draw attention to a specific part
          of the page. Here, we are drawing the attention towards the text
          section of the page. I don&apos;t know why but I&apos;m running out of
          copy.
        </p>
      </div>
    </section>
  );
}
