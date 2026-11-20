import { useState, useEffect } from 'react';

/**
 * 监听 `prefers-reduced-motion`。默认 false，挂载后才读取系统偏好，
 * 避免服务端与客户端首屏不一致。
 */
export const usePrefersReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    query.addEventListener('change', handleChange);
    return () => {
      query.removeEventListener('change', handleChange);
    };
  }, []);

  return reducedMotion;
};
