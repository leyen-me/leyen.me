// Template: component entry (self-sized widget).
// Delete "use client" if the final demo has no hooks, state, or event handlers.
"use client";

export default function Demo() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-medium text-zinc-900 dark:text-white">
        Component title
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        Replace this with the real demo. Keep it to one idea.
      </p>
    </div>
  );
}
