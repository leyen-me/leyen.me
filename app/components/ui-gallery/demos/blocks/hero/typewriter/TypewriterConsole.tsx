'use client';

import { useState, useCallback } from 'react';
import { Signal } from 'lucide-react';
import { DeviceScreen } from './DeviceScreen';
import { ControlPanel } from './ControlPanel';
import { DEVICE } from './constants';

interface TypewriterConsoleProps {
  onPrint: (text: string) => void;
  onClearAll: () => void;
}

export const TypewriterConsole: React.FC<TypewriterConsoleProps> = ({
  onPrint,
  onClearAll,
}) => {
  const [input, setInput] = useState('');

  const handlePrint = useCallback(() => {
    if (!input.trim()) return;
    onPrint(input);
    setInput('');
  }, [input, onPrint]);

  return (
    <div className="relative pointer-events-auto mb-6 scale-90 md:scale-100 origin-bottom transition-transform duration-300">
      {/* 设备容器 */}
      <div
        className="relative bg-gradient-to-b from-lime-500 to-lime-600 rounded-[3rem] p-6 shadow-2xl border-t border-white/30 md:w-[440px]"
        style={{
          width: `${DEVICE.WIDTH_MOBILE}px`,
          boxShadow: `
            0 50px 60px -20px rgba(0,0,0,0.6),
            inset 0 2px 10px rgba(255,255,255,0.4),
            inset 0 -10px 20px rgba(0,0,0,0.2)
          `,
        }}
      >
        {/* 纹理叠加层 */}
        <div className="absolute inset-0 rounded-[3rem] opacity-20 pointer-events-none mix-blend-overlay">
          <div
            className="w-full h-full rounded-[3rem]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.03) 2px,
                rgba(0,0,0,0.03) 4px
              )`,
            }}
          />
        </div>

        {/* 纸张出口槽 */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-64 h-5 bg-gray-900 rounded-full shadow-inner border-b border-gray-700 z-0" />

        {/* 顶部高光 */}
        <div className="absolute top-2 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full blur-[1px]" />

        {/* 内边框 */}
        <div className="relative bg-[#8ec93e] rounded-3xl p-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.3),0_2px_4px_rgba(255,255,255,0.2)] border border-lime-700/20">
          {/* 顶部面板（品牌和指示器） */}
          <div className="flex justify-between items-end mb-3 px-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]" />
                <span className="text-[10px] font-black tracking-widest text-lime-900 uppercase tw-lcd">
                  Auto-Feed
                </span>
              </div>
              <div className="text-lime-800/60 text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">
                Series 9000
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-60 text-lime-900">
              <Signal size={14} aria-hidden="true" />
              <span className="text-xs tw-lcd">5G</span>
            </div>
          </div>

          {/* 屏幕 */}
          <DeviceScreen input={input} onInputChange={setInput} />

          {/* 控制面板 */}
          <ControlPanel
            input={input}
            onPrint={handlePrint}
            onClearAll={onClearAll}
          />
        </div>

        {/* 底部品牌标签 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-0.5 rounded text-[8px] text-lime-500 font-mono tracking-widest border border-lime-500/30 shadow-sm">
          MOTOROLA
        </div>
      </div>

      {/* 桌面反射效果 */}
      <div className="absolute -bottom-4 left-10 right-10 h-8 bg-lime-500/30 blur-xl rounded-full z-[-1]" />
    </div>
  );
};
