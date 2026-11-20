"use client";

import { useEffect, useState } from "react";
import Folder from "./Folder";

/** 跟随 html.dark（详情预览、列表 iframe、主文档都适用）。 */
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

const items = [
  {
    title: "Design tokens",
    description: "Surfaces, radii and ink pairs used across the gallery.",
  },
  {
    title: "Motion rules",
    description: "Durations, easing and reduced-motion fallbacks.",
  },
  {
    title: "Component specs",
    description: "Sizes, spacing and interaction states.",
  },
];

export default function Demo() {
  const dark = useDarkMode();

  return (
    <section className="relative flex min-h-[600px] w-full items-center justify-center overflow-hidden bg-surface-0 px-6 py-16">
      <Folder
        color="#3d8bff"
        items={items}
        label="UI"
        mode="flap"
        paperColor="#ffffff"
        size={1.1}
        theme={dark ? "dark" : "light"}
        variant="solid"
      />
    </section>
  );
}
