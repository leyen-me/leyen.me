"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 900;

type PreviewFrameProps = {
  src: string;
  title: string;
  /** 用于重置 iframe 内容 */
  reloadKey?: number | string;
};

export function PreviewFrame({ src, title, reloadKey }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(420);
  const { resolvedTheme } = useTheme();

  const sendTheme = useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow;
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
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data as
        | { source?: string; type?: string; height?: unknown }
        | null;
      if (!data || data.source !== "ui-gallery:preview" || data.type !== "height") {
        return;
      }

      const next = Number(data.height);
      if (!Number.isFinite(next)) return;
      setHeight(Math.min(Math.max(Math.round(next), MIN_HEIGHT), MAX_HEIGHT));
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    sendTheme();
  }, [sendTheme]);

  /**
   * 这里刻意不设置 sandbox：demo 都是本仓库第一方代码，且需要同源
   * 的 postMessage、next-themes 与字体资源。`allow-scripts` 与
   * `allow-same-origin` 同时存在时浏览器会告警「可逃逸沙箱」，
   * 既然内容可信，直接省略沙箱以免留下无意义的虚假安全感。
   */
  return (
    <iframe
      ref={iframeRef}
      key={reloadKey}
      src={src}
      title={title}
      loading="lazy"
      onLoad={sendTheme}
      allow="clipboard-write"
      className="block w-full border-0 bg-transparent"
      style={{ height }}
    />
  );
}
