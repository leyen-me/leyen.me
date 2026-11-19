"use client";

import { useEffect } from "react";

/**
 * 挂载在 iframe 预览页中：
 *  - 把内容高度通过 postMessage 同步给父页面
 *  - 接收父页面的主题切换并应用到 iframe 文档
 */
export function PreviewBridge() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const postHeight = () => {
      const height = Math.max(
        root.scrollHeight,
        root.offsetHeight,
        document.body.scrollHeight,
        document.body.offsetHeight
      );
      window.parent?.postMessage(
        {
          source: "ui-gallery:preview",
          type: "height",
          height,
        },
        window.location.origin
      );
    };

    const schedulePost = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(postHeight);
    };

    const resizeObserver = new ResizeObserver(schedulePost);
    resizeObserver.observe(document.body);
    resizeObserver.observe(root);
    schedulePost();

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as
        | { source?: string; type?: string; theme?: string }
        | null;
      if (!data || data.source !== "ui-gallery:parent" || data.type !== "theme") {
        return;
      }

      const dark = data.theme !== "light";
      root.classList.toggle("dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
      schedulePost();
    }

    window.addEventListener("message", handleMessage);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}
