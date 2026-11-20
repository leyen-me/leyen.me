/**
 * Typewriter Effect — ported from Aceternity UI's component of the same name.
 * Source: https://ui.aceternity.com/components/typewriter-effect
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the "Build awesome apps with Aceternity." headline
 * with its blue accent word, the "The road to freedom starts from here" line,
 * the blinking cursor and the "Join now" / "Signup" actions.
 * Changed for the gallery: the hero section fills the ?fill=1 iframe, the
 * character reveal is CSS keyframes over opacity only (the upstream
 * framer-motion width sweep would reflow the line), the sentence is exposed
 * once to assistive technology, and reduced motion removes the stagger while
 * keeping the fades.
 */

type Word = { text: string; className?: string };

const WORDS: Word[] = [
  { text: "Build" },
  { text: "awesome" },
  { text: "apps" },
  { text: "with" },
  { text: "Aceternity.", className: "text-blue-500" },
];

const TYPEWRITER_CSS = `
@keyframes ui-type-char-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ui-type-caret-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.ui-type-char {
  opacity: 0;
  animation: ui-type-char-in 0.28s ease-out forwards;
}
.ui-type-caret {
  animation: ui-type-caret-blink 1.6s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .ui-type-char { animation-delay: 0s !important; }
  .ui-type-caret { animation-delay: 0s !important; }
}
`;

export default function Demo() {
  let order = 0;

  return (
    <section className="flex h-full min-h-[600px] w-full flex-col items-center justify-center overflow-hidden bg-white px-6 py-20 text-center dark:bg-zinc-950">
      <style>{TYPEWRITER_CSS}</style>

      <p className="text-xs text-neutral-600 dark:text-neutral-200 sm:text-base">
        The road to freedom starts from here
      </p>

      <h1 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl md:text-5xl">
        <span className="sr-only">Build awesome apps with Aceternity.</span>
        <span
          aria-hidden="true"
          className="inline-flex flex-wrap items-center justify-center"
        >
          {WORDS.map((word) => (
            <span className="inline-block whitespace-nowrap" key={word.text}>
              {Array.from(word.text).map((char) => {
                const delay = 0.6 + order * 0.055;
                order += 1;
                return (
                  <span
                    className={`ui-type-char inline-block ${word.className ?? ""}`}
                    key={`${word.text}-${order}`}
                    style={{ animationDelay: `${delay.toFixed(3)}s` }}
                  >
                    {char}
                  </span>
                );
              })}
              <span>&nbsp;</span>
            </span>
          ))}
          <span
            aria-hidden="true"
            className="ui-type-caret ml-1 inline-block h-[0.85em] w-[4px] rounded-sm bg-blue-500 align-baseline"
            style={{ animationDelay: "1.4s" }}
          />
        </span>
      </h1>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <button
          className="h-10 w-40 rounded-xl border border-transparent bg-black text-sm text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-zinc-950"
          type="button"
        >
          Join now
        </button>
        <button
          className="h-10 w-40 rounded-xl border border-black bg-white text-sm text-black transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-950"
          type="button"
        >
          Signup
        </button>
      </div>
    </section>
  );
}
