"use client";

/**
 * Typewriter — ported from the original project by leyen-me.
 * Source: https://github.com/leyen-me/typewriter (MIT).
 *
 * Kept from the original: the radial desk light + 50px grid, the bottom-centred
 * printer console, `DraggablePaper` (torn mask edges, PAGER MESSAGE header,
 * dashed rules, barcode footer), the screen with PRINT / TRASH controls, the
 * real `useTypingAnimation` cadence, the copy, and the eject keyframes.
 *
 * Changed for the gallery:
 * - Google fonts (Special Elite / VT323) are replaced by local system stacks.
 * - Card coordinates are measured against this section instead of the window,
 *   so the block behaves the same inside the ?fill=1 iframe.
 * - Dragging uses pointer events (mouse unchanged, touch added), cards are
 *   clamped so they stay reachable, and paper cards are keyboard movable.
 * - Reduced motion drops the paper rise / eject travel / drag scale.
 */

import { useCallback, useRef, useState } from "react";
import type { PaperCardData, Coordinates, StageSize } from "./types";
import { DraggablePaper } from "./DraggablePaper";
import { TypewriterConsole } from "./TypewriterConsole";
import {
  COLORS,
  DEFAULT_CARD_WIDTH,
  STAGE,
  Z_INDEX,
} from "./constants";
import { calculateInitialCardPosition } from "./useCardPosition";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const TYPEWRITER_CSS = `
@keyframes tw-eject {
  0% { transform: translateY(15%); }
  50% { transform: translateY(-5%); }
  100% { transform: translateY(0); }
}
.tw-paper {
  font-family: "American Typewriter", "Courier New", "Songti SC", "STSong",
    ui-serif, monospace;
}
.tw-lcd {
  font-family: ui-monospace, "SFMono-Regular", Menlo, "Courier New",
    "Songti SC", monospace;
}
`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const clampToStage = (position: Coordinates, stage: StageSize): Coordinates => ({
  x: clamp(
    position.x,
    STAGE.MIN_VISIBLE_X - DEFAULT_CARD_WIDTH,
    Math.max(stage.width - STAGE.MIN_VISIBLE_X, 0)
  ),
  y: clamp(position.y, -24, Math.max(stage.height - STAGE.MIN_VISIBLE_Y, 0)),
});

export default function Demo() {
  const [cards, setCards] = useState<PaperCardData[]>([]);
  const stageRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const readStage = useCallback((): StageSize | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    return { width: stage.clientWidth, height: stage.clientHeight };
  }, []);

  const handlePrint = useCallback(
    (text: string) => {
      const { x, y, rotation } = calculateInitialCardPosition(readStage());

      const newCard: PaperCardData = {
        id: crypto.randomUUID(),
        text,
        x,
        y,
        rotation,
        timestamp: Date.now(),
        isTyping: true,
      };

      setCards((prev) => [...prev, newCard]);
    },
    [readStage]
  );

  const handleUpdateCard = useCallback(
    (id: string, updates: Partial<PaperCardData>) => {
      setCards((prev) =>
        prev.map((card) => {
          if (card.id !== id) return card;
          if (updates.x === undefined || updates.y === undefined) {
            return { ...card, ...updates };
          }
          const stage = readStage();
          const position = stage
            ? clampToStage({ x: updates.x, y: updates.y }, stage)
            : { x: updates.x, y: updates.y };
          return { ...card, ...updates, ...position };
        })
      );
    },
    [readStage]
  );

  const handleDeleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    if (window.confirm("Clear all messages?")) {
      setCards([]);
    }
  }, []);

  const handleFocus = useCallback((id: string) => {
    // 将卡片移到数组末尾，实现"置顶"效果
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card) return prev;
      const others = prev.filter((c) => c.id !== id);
      return [...others, card];
    });
  }, []);

  return (
    <section
      ref={stageRef}
      aria-label="Vintage typewriter demo"
      className="relative h-full min-h-[600px] w-full overflow-hidden"
      style={{ backgroundColor: COLORS.DESK_BG }}
    >
      <style dangerouslySetInnerHTML={{ __html: TYPEWRITER_CSS }} />

      {/* 桌面背景纹理 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #ffffff 0%, #d4d8e0 60%, #9ca3af 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `linear-gradient(${COLORS.DESK_GRID} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.DESK_GRID} 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* 卡片渲染区域 */}
      <div className="absolute inset-0 w-full h-full">
        {cards.map((card, index) => (
          <DraggablePaper
            key={card.id}
            data={card}
            zIndex={index + Z_INDEX.BASE}
            onUpdate={handleUpdateCard}
            onDelete={handleDeleteCard}
            onFocus={() => handleFocus(card.id)}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* 控制台 UI - 底部居中 */}
      <div
        className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none"
        style={{ zIndex: Z_INDEX.MACHINE }}
      >
        <TypewriterConsole onPrint={handlePrint} onClearAll={handleClearAll} />
      </div>
    </section>
  );
}
