import React from 'react';
import { Printer, Trash2 } from 'lucide-react';

interface ControlPanelProps {
  input: string;
  onPrint: () => void;
  onClearAll: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  input,
  onPrint,
  onClearAll,
}) => {
  return (
    <div className="mt-5 grid grid-cols-4 gap-3 items-center">
      {/* Clear Button */}
      <button
        type="button"
        onClick={onClearAll}
        className="col-span-1 aspect-square rounded-full bg-zinc-800 shadow-[0_4px_0_#000,0_5px_10px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all border-t border-zinc-600 flex items-center justify-center group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        title="Trash"
        aria-label="Clear all messages"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 rounded-full" />
        <Trash2
          size={18}
          className="text-gray-400 group-hover:text-red-400 transition-colors"
          aria-hidden="true"
        />
      </button>

      {/* 装饰性格栅 */}
      <div className="col-span-1 flex flex-col items-center gap-1 px-2" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-1 bg-lime-900/20 rounded-full"
          />
        ))}
      </div>

      {/* Print Button */}
      <button
        type="button"
        onClick={onPrint}
        disabled={!input.trim()}
        className="col-span-2 h-14 bg-orange-600 rounded-lg shadow-[0_5px_0_#9a3412,0_8px_15px_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-[5px] transition-all border-t border-orange-400 flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-100"
        aria-label="Print message"
      >
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
        <span className="tw-lcd text-2xl text-orange-950 font-bold drop-shadow-sm mt-1">
          PRINT
        </span>
        <Printer size={20} className="text-orange-950 mb-0.5" aria-hidden="true" />
      </button>
    </div>
  );
};
