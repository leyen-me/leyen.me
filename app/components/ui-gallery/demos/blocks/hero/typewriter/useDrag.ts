import { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates } from './types';
import { ANIMATION } from './constants';

interface UseDragProps {
  /** 卡片当前位置，决定抓取点偏移 */
  initialPosition: Coordinates;
  onUpdate: (position: Coordinates) => void;
}

/**
 * 拖动纸卡。源项目使用 mouse 事件；这里改用 pointer 事件，鼠标行为不变，
 * 同时让触屏也能拖动。监听器在拖动结束或组件卸载时移除。
 */
export const useDrag = ({ initialPosition, onUpdate }: UseDragProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Coordinates>({ x: 0, y: 0 });
  const positionRef = useRef(initialPosition);
  positionRef.current = initialPosition;

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      onUpdate({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, onUpdate]);

  const startDrag = useCallback((e: React.PointerEvent, currentPosition: Coordinates) => {
    // 只响应主键；右键和键盘触发不进入拖动。
    if (e.button !== 0) return;
    dragOffset.current = {
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y,
    };
    setIsDragging(true);
  }, []);

  return {
    isDragging,
    startDrag,
    scale: isDragging ? ANIMATION.DRAG_SCALE : 1,
  };
};
