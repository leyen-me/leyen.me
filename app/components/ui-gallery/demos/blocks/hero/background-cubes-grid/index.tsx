"use client";

/**
 * 移植自 Aceternity UI 的 Background Cubes Grid（等距方块阵）。
 * 来源：https://ui.aceternity.com/components/background-cubes-grid
 * 许可：https://ui.aceternity.com/licence（已获作者授权）。
 *
 * 只保留效果本身：一个铺满区块的等距方块阵，指针划过时涌动，
 * 按下时落下一道更深的涟漪。无标题、按钮或任何叠加内容。
 */

import { useEffect, useState } from "react";
import { BackgroundCubesGrid, type CubesPalette } from "./CubesGrid";

/** 亮色沿用原示范例的暖灰石材；暗色为同结构的低亮度版本。 */
const PALETTES: Record<"light" | "dark", CubesPalette> = {
  light: {
    top: "#fafaf9",
    left: "#e7e5e4",
    right: "#d6d3d1",
    glow: "#a8a29e",
  },
  dark: {
    top: "#3a3a40",
    left: "#2a2a2f",
    right: "#1e1e22",
    glow: "#71717a",
  },
};

/** iframe 预览的主题由 PreviewBridge 切换 html.dark，这里跟随它。 */
function useDarkMode(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

export default function Demo() {
  const dark = useDarkMode();
  const palette = dark ? PALETTES.dark : PALETTES.light;

  return (
    <section
      className="relative h-full min-h-[600px] w-full overflow-hidden"
      style={{ backgroundColor: palette.top }}
    >
      <BackgroundCubesGrid palette={palette} />
    </section>
  );
}
