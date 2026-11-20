"use client";

import { useEffect, useState } from "react";
import SwarmCursor from "./SwarmCursor";

/** iframe 预览里的主题由 PreviewBridge 切换 html.dark，这里跟随它。 */
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

  return (
    <section
      className="relative isolate overflow-hidden bg-surface-0"
      id="swarm"
    >
      <SwarmCursor
        accentColor="#33E092"
        className="min-h-[600px]"
        color={dark ? "#fafafa" : "#18181b"}
        dpr={1}
        lightMode={!dark}
      >
        <div className="relative mx-auto flex min-h-[600px] w-full max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-[#17181a] dark:text-white sm:text-5xl">
            A swarm that follows
            <br className="hidden sm:block" /> your every move.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            流体粒子在指针周围聚成漩涡，靠近按钮时自动分流绕行，点击则向四周炸开。
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#17181a] px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 dark:bg-white dark:text-[#17181a] dark:hover:bg-zinc-200"
              href="#swarm"
            >
              Start building
            </a>
            <a
              className="inline-flex h-10 items-center justify-center rounded-full bg-surface-1 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 dark:text-zinc-200"
              href="#swarm"
            >
              See how it works
            </a>
          </div>
        </div>
      </SwarmCursor>
    </section>
  );
}
