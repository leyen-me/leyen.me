import { useMemo } from 'react';
import { DEFAULT_CARD_WIDTH, CARD_POSITION, ANIMATION } from './constants';
import type { StageSize } from './types';

export const useCardPosition = (isTyping: boolean, progress: number) => {
  const translateY = useMemo(() => {
    if (isTyping) {
      // 打字时：从 100% (隐藏) 到 15% (保持点) 基于进度
      return 100 - progress * (100 - ANIMATION.TYPING_HOLD_PERCENT);
    }
    return undefined;
  }, [isTyping, progress]);

  return { translateY };
};

/**
 * 源项目用 `window.innerHeight` 计算纸张出生点。区块在 iframe 里运行时，
 * 舞台尺寸才是可靠的参照，因此这里优先使用舞台尺寸，退回到窗口尺寸。
 */
export const calculateInitialCardPosition = (stage?: StageSize | null) => {
  const viewportWidth = stage?.width ?? window.innerWidth;
  const viewportHeight = stage?.height ?? window.innerHeight;
  const targetY = viewportHeight - CARD_POSITION.CARD_OFFSET_FROM_MACHINE;
  const centerX = viewportWidth / 2 - DEFAULT_CARD_WIDTH / 2;
  const rotation =
    Math.random() * CARD_POSITION.ROTATION_RANGE +
    CARD_POSITION.ROTATION_OFFSET;

  return { x: centerX, y: targetY, rotation };
};
