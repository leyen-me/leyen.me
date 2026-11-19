"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 进入视口后再挂载子树，用于列表页的实时预览，
 * 避免一次性启动所有 demo（尤其是带动画或观察器的组件）。
 */
export function LazyMount({
  children,
  className,
  fallback,
}: {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || visible) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={containerRef} className={className}>
      {visible ? children : (fallback ?? null)}
    </div>
  );
}
