"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const Hero3DScene = dynamic(() => import("./Hero3DScene"), {
  ssr: false,
  loading: () => (
    <div className="lg:w-[450px] w-full h-[350px] rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center">
      <span className="text-zinc-500 dark:text-zinc-400 text-sm">加载中...</span>
    </div>
  ),
});

export default function Hero3D() {
  return (
    <div className="lg:w-[450px] w-full h-[350px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg">
      <Suspense
        fallback={
          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        }
      >
        <Hero3DScene />
      </Suspense>
    </div>
  );
}
