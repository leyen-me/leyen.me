import { useState, useEffect, useRef } from 'react';
import { TYPING_CONFIG } from './constants';

interface UseTypingAnimationProps {
  text: string;
  isTyping: boolean;
  onComplete: () => void;
}

/**
 * 逐字打字动画，保留源项目的随机节奏：
 * 每个字符的间隔是 `Math.random() * variance + minDelay`，
 * 文本越长节奏越快；定时器会在卸载或重新开始时清理。
 */
export const useTypingAnimation = ({
  text,
  isTyping,
  onComplete,
}: UseTypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const textIndex = useRef(0);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isTyping) {
      setDisplayedText('');
      textIndex.current = 0;

      const typeNextChar = () => {
        if (textIndex.current < text.length) {
          setDisplayedText((prev) => prev + text.charAt(textIndex.current));
          textIndex.current++;

          // 根据文本长度动态调整打字速度
          const length = text.length;
          let minDelay: number;
          let variance: number;

          if (length > TYPING_CONFIG.LONG_TEXT_THRESHOLD) {
            minDelay = TYPING_CONFIG.LONG_TEXT.MIN_DELAY;
            variance = TYPING_CONFIG.LONG_TEXT.VARIANCE;
          } else if (length > TYPING_CONFIG.SHORT_TEXT_THRESHOLD) {
            minDelay = TYPING_CONFIG.MEDIUM_TEXT.MIN_DELAY;
            variance = TYPING_CONFIG.MEDIUM_TEXT.VARIANCE;
          } else {
            minDelay = TYPING_CONFIG.SHORT_TEXT.MIN_DELAY;
            variance = TYPING_CONFIG.SHORT_TEXT.VARIANCE;
          }

          const delay = Math.random() * variance + minDelay;
          typingTimeout.current = setTimeout(typeNextChar, delay);
        } else {
          onComplete();
        }
      };

      typingTimeout.current = setTimeout(
        typeNextChar,
        TYPING_CONFIG.INITIAL_DELAY
      );
    } else {
      setDisplayedText(text);
    }

    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [isTyping, text, onComplete]);

  const progress = text.length > 0 ? displayedText.length / text.length : 0;

  return {
    displayedText,
    progress,
  };
};
