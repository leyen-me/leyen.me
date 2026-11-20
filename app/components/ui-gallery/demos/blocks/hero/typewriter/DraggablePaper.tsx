'use client';

import { useCallback } from 'react';
import { PaperCardData } from './types';
import { X } from 'lucide-react';
import { useTypingAnimation } from './useTypingAnimation';
import { useCardPosition } from './useCardPosition';
import { useDrag } from './useDrag';
import { COLORS, DEFAULT_CARD_WIDTH, ANIMATION, KEYBOARD_STEP } from './constants';

interface DraggablePaperProps {
  data: PaperCardData;
  onUpdate: (id: string, updates: Partial<PaperCardData>) => void;
  onDelete: (id: string) => void;
  zIndex: number;
  onFocus: () => void;
  reducedMotion: boolean;
}

const formatTimestamp = (timestamp: number) => {
  const dateObj = new Date(timestamp);
  const dateStr = dateObj.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
  const timeStr = dateObj.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  return { dateStr, timeStr };
};

const serratedEdgeStyle = {
  top: {
    backgroundColor: COLORS.PAPER,
    maskImage: 'radial-gradient(circle at 5px 0, transparent 5px, black 5.5px)',
    maskSize: '10px 10px',
    maskRepeat: 'repeat-x' as const,
    maskPosition: 'bottom',
    WebkitMaskImage: 'radial-gradient(circle at 5px 0, transparent 5px, black 5.5px)',
    WebkitMaskSize: '10px 10px',
    WebkitMaskRepeat: 'repeat-x' as const,
    WebkitMaskPosition: 'bottom',
  },
  bottom: {
    backgroundColor: COLORS.PAPER,
    maskImage: 'radial-gradient(circle at 5px 10px, transparent 5px, black 5.5px)',
    maskSize: '10px 10px',
    maskRepeat: 'repeat-x' as const,
    maskPosition: 'top',
    WebkitMaskImage: 'radial-gradient(circle at 5px 10px, transparent 5px, black 5.5px)',
    WebkitMaskSize: '10px 10px',
    WebkitMaskRepeat: 'repeat-x' as const,
    WebkitMaskPosition: 'top',
  },
};

export const DraggablePaper: React.FC<DraggablePaperProps> = ({
  data,
  onUpdate,
  onDelete,
  zIndex,
  onFocus,
  reducedMotion,
}) => {
  const { displayedText, progress } = useTypingAnimation({
    text: data.text,
    isTyping: data.isTyping,
    onComplete: useCallback(() => {
      onUpdate(data.id, { isTyping: false });
    }, [data.id, onUpdate]),
  });

  const { translateY } = useCardPosition(data.isTyping, progress);

  const { startDrag, scale } = useDrag({
    initialPosition: { x: data.x, y: data.y },
    onUpdate: useCallback(
      (position) => {
        onUpdate(data.id, position);
      },
      [data.id, onUpdate]
    ),
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onFocus();
      startDrag(e, { x: data.x, y: data.y });
    },
    [onFocus, startDrag, data.x, data.y]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(data.id);
    },
    [data.id, onDelete]
  );

  // 无障碍：纸卡可聚焦后用方向键移动，源项目只用鼠标拖动。
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const delta = {
        ArrowLeft: { x: -KEYBOARD_STEP, y: 0 },
        ArrowRight: { x: KEYBOARD_STEP, y: 0 },
        ArrowUp: { x: 0, y: -KEYBOARD_STEP },
        ArrowDown: { x: 0, y: KEYBOARD_STEP },
      }[e.key];

      if (!delta) return;
      e.preventDefault();
      onUpdate(data.id, { x: data.x + delta.x, y: data.y + delta.y });
    },
    [data.id, data.x, data.y, onUpdate]
  );

  const { dateStr, timeStr } = formatTimestamp(data.timestamp);

  return (
    <div
      className={`absolute cursor-move select-none ${
        data.isTyping ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      style={{
        left: data.x,
        top: data.y,
        zIndex,
        width: `${DEFAULT_CARD_WIDTH}px`,
        transform: `rotate(${data.rotation}deg) scale(${
          reducedMotion ? 1 : scale
        })`,
        transition: `transform ${ANIMATION.TRANSITION_DURATION}ms ease-out`,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      tabIndex={data.isTyping ? -1 : 0}
      aria-label="Printed paper message"
      data-typewriter-paper=""
    >
      {/* 动画包装器 */}
      <div
        style={{
          transform:
            !reducedMotion && translateY !== undefined
              ? `translateY(${translateY}%)`
              : undefined,
          animation:
            !data.isTyping && !reducedMotion
              ? `tw-eject ${ANIMATION.EJECT_DURATION}ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`
              : 'none',
          transition:
            data.isTyping && !reducedMotion ? 'transform 0.1s linear' : 'none',
          transformOrigin: 'bottom center',
        }}
      >
        {/* 纸张卡片 */}
        <div
          className="relative shadow-md"
          style={{
            backgroundColor: COLORS.PAPER,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        >
          {/* 顶部锯齿边缘 */}
          <div
            className="absolute -top-1.5 left-0 w-full h-3"
            style={serratedEdgeStyle.top}
          />

          {/* 纸张内容 */}
          <div className="px-5 py-6 relative overflow-hidden">
            {/* 删除按钮 */}
            {!data.isTyping && (
              <button
                type="button"
                onClick={handleDelete}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors z-10 mix-blend-multiply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 rounded-sm"
                aria-label="Delete message"
              >
                <X size={14} />
              </button>
            )}

            {/* Header Info */}
            <div className="flex flex-col items-center border-b border-dashed border-gray-400/50 pb-3 mb-4 opacity-70 font-mono text-[10px] text-gray-600">
              <span className="uppercase tracking-widest font-bold text-[11px] text-gray-800">
                Pager Message
              </span>
              <div className="flex justify-between w-full mt-1.5 px-1 text-[9px] tracking-tight">
                <span>ID: {data.id.slice(0, 6).toUpperCase()}</span>
                <span className="font-semibold">
                  {dateStr} {timeStr}
                </span>
              </div>
            </div>

            {/* 消息正文 */}
            <div
              className="tw-paper text-lg leading-relaxed text-gray-900 break-words whitespace-pre-wrap min-h-[2.5rem]"
              style={{ textShadow: '0 0 1px rgba(0,0,0,0.1)' }}
            >
              {displayedText}
              {data.isTyping && (
                <span className="inline-block w-2.5 h-4 bg-gray-800 ml-0.5 animate-pulse align-middle opacity-80" />
              )}
            </div>

            {/* Footer Barcode-ish look */}
            <div className="mt-5 pt-3 border-t border-gray-400/30 flex justify-between items-end opacity-50 text-gray-700">
              <div
                className="h-3 w-20 bg-current opacity-30"
                style={{
                  maskImage: 'linear-gradient(90deg, black 50%, transparent 50%)',
                  maskSize: '3px 100%',
                }}
              />
              <span className="text-[8px] font-mono tracking-wide">
                END OF TRANSMISSION
              </span>
            </div>
          </div>

          {/* 底部锯齿边缘 */}
          <div
            className="absolute -bottom-1.5 left-0 w-full h-3"
            style={serratedEdgeStyle.bottom}
          />
        </div>
      </div>
    </div>
  );
};
