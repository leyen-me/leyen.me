"use client";

export default function Demo() {
  return (
    <div className="w-full max-w-xl">
      <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
        Typography
      </p>
      <h2 className="mt-3 bg-[linear-gradient(90deg,#33E092,#22d3ee,#a855f7,#33E092)] bg-[length:200%_100%] bg-left bg-clip-text font-semibold tracking-tight text-transparent transition-[background-position] duration-700 ease-out hover:bg-right sm:text-4xl text-3xl">
        Design in motion,
        <br />
        ship in silence.
      </h2>
      <p className="mt-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        文字渐变来自 <code className="font-mono text-[12px]">bg-clip-text</code>，
        悬停时移动背景位置，不会引起重排。
      </p>
    </div>
  );
}
