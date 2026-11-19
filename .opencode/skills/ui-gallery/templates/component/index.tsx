// Template: component entry (self-sized widget).
// Delete "use client" if the final demo has no hooks, state, or event handlers.
// Surfaces come from the shared tokens; there is no decorative outline.
"use client";

export default function Demo() {
  return (
    <div className="w-full max-w-sm rounded-panel bg-surface-0 p-6">
      <p className="text-sm font-medium text-[#17181a] dark:text-white">
        Component title
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        Replace this with the real demo. Keep it to one idea.
      </p>
    </div>
  );
}
