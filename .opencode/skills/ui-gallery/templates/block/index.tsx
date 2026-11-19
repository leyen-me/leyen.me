// Template: block entry (full-width section rendered in an iframe).
// Do not use min-h-screen: the iframe height is measured from the content.
// Page-level backgrounds stay literal; inner surfaces use bg-surface-*.
"use client";

export default function Demo() {
  return (
    <section className="bg-white px-6 py-16 dark:bg-zinc-950 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-500">
          Section
        </p>
        <h2 className="mt-3 font-semibold tracking-tight text-zinc-900 sm:text-3xl text-2xl dark:text-white">
          Block title
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Replace this with the real block. Own the background and vertical
          rhythm.
        </p>
      </div>
    </section>
  );
}
