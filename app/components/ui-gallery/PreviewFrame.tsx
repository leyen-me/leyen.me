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

  return (
    <iframe
      ref={iframeRef}
      key={reloadKey}
      src={src}
      title={title}
      loading="lazy"
      onLoad={sendTheme}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      allow="clipboard-write"
      className="block w-full border-0 bg-transparent"
      style={{ height }}
    />
  );
}
