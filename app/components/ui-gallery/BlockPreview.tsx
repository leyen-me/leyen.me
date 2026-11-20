"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { LazyMount } from "./LazyMount";

/**
 * blocks 在列表里用 iframe 隔离：每个区块拥有自己的 document、WebGL 上下文
 * 与全局事件，避免多个重 demo 互相抢占上下文或污染 Gallery 主页面。
 */
export function BlockPreview({ id, title }: { id: string; title: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();

  const sendTheme = useCallback(() => {
    const frameWindow = frameRef.current?.contentWindow;
    if (!frameWindow) return;
    frameWindow.postMessage(
      {
        source: "ui-gallery:parent",
        type: "theme",
        theme: resolvedTheme === "light" ? "light" : "dark",
      },
      window.location.origin
    );
  }, [resolvedTheme]);

  useEffect(() => {
    sendTheme();
  }, [sendTheme]);

  return (
    <LazyMount
      className="h-full w-full"
      fallback={<div className="h-full w-full bg-surface-0" />}
    >
      <iframe
        allow="clipboard-write; camera"
        className="block h-full w-full border-0 bg-transparent"
        loading="lazy"
        onLoad={sendTheme}
        ref={frameRef}
        src={`/ui/preview/${id}?fill=1`}
        title={`${title} 预览`}
      />
    </LazyMount>
  );
}
