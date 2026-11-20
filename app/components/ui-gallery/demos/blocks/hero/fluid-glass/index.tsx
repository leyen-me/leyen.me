"use client";

import { useEffect, useState } from "react";
import FluidGlass from "./FluidGlass";

/** iframe 与列表卡片都通过 html.dark 表达主题，这里跟随它切换画布配色。 */
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
  const ink = dark ? "#fafafa" : "#18181b";

  return (
    <section className="relative isolate overflow-hidden bg-surface-0">
      <FluidGlass
        background="transparent"
        className="min-h-[600px]"
        color="#33E092"
        dispersion={0.35}
        elevation={0.45}
        fontWeight={600}
        shape="torus"
        shadow={0.55}
        size={300}
        text={"Liquid\nglass"}
        textColor={ink}
        tint={0.18}
      />
    </section>
  );
}
