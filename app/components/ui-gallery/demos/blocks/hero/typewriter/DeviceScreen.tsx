import React from 'react';
import { MessageSquare, BatteryMedium } from 'lucide-react';

interface DeviceScreenProps {
  input: string;
  onInputChange: (value: string) => void;
}

export const DeviceScreen: React.FC<DeviceScreenProps> = ({
  input,
  onInputChange,
}) => {
  return (
    <div className="bg-[#0d160d] rounded-xl p-1 pb-0 shadow-[inset_0_0_20px_rgba(0,0,0,1)] border-b-2 border-white/10 relative overflow-hidden">
      {/* 屏幕扫描线效果 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />

      <div className="relative z-20 p-2">
        <div className="flex justify-between text-[#1a5c1a] text-xs mb-1 tw-lcd border-b border-[#1a5c1a]/30 pb-1">
          <div className="flex gap-2 items-center">
            <MessageSquare size={12} aria-hidden="true" />
            <span>COMPOSE_MODE</span>
          </div>
          <BatteryMedium size={12} aria-hidden="true" />
        </div>

        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-full h-20 bg-transparent resize-none outline-none tw-lcd text-xl text-[#4aff4a] placeholder-[#1a5c1a] uppercase tracking-wider leading-tight rounded-sm"
          placeholder="TYPE MESSAGE HERE..."
          spellCheck={false}
          aria-label="Compose message"
          style={{ textShadow: '0 0 5px rgba(74, 255, 74, 0.5)' }}
        />
      </div>
    </div>
  );
};
