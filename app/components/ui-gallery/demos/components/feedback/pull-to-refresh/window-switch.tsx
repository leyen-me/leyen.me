import { WINDOWS } from "./engine";

type Props = {
  view: number;
  onChange: (index: number) => void;
};

export function WindowSwitch({ view, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Time window"
      className="relative mt-4 flex gap-1"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 rounded-[16px] bg-[#17181a]/[0.06] transition-transform duration-[420ms] ease-[cubic-bezier(.24,1.34,.38,1)] motion-reduce:transition-none dark:bg-white/[0.06]"
        style={{
          width: "calc((100% - 8px) / 3)",
          transform: `translateX(calc(${view} * (100% + 4px)))`,
        }}
      />
      {WINDOWS.map((window, index) => (
        <button
          key={window.id}
          type="button"
          aria-pressed={index === view}
          onClick={() => {
            if (index !== view) onChange(index);
          }}
          className={`relative z-[1] h-8 flex-1 rounded-[16px] border-0 bg-transparent p-0 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
            index === view
              ? "text-[#17181a] dark:text-white"
              : "text-[#17181a]/[0.52] hover:text-[#17181a] dark:text-white/[0.52] dark:hover:text-white"
          }`}
        >
          {window.label}
        </button>
      ))}
    </div>
  );
}
