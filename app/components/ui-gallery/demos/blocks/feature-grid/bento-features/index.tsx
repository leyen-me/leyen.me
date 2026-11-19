"use client";

import { Gauge, Layers, ShieldCheck, Sparkles, Zap } from "lucide-react";

const features = [
  {
    title: "Edge-ready",
    description: "默认走边缘节点，全球首屏延迟保持在两位数毫秒。",
    icon: Zap,
    className: "md:col-span-2",
  },
  {
    title: "Typed end to end",
    description: "从数据层到组件 props，一路严格类型。",
    icon: Layers,
    className: "",
  },
  {
    title: "Secure by default",
    description: "会话加密、CSRF 防护与最小权限。",
    icon: ShieldCheck,
    className: "",
  },
  {
    title: "Observable",
    description: "内置指标、日志关联 ID 与错误追踪。",
    icon: Gauge,
    className: "",
  },
  {
    title: "Composable",
    description: "每个区块都是独立组件，按需拼装。",
    icon: Sparkles,
    className: "md:col-span-2",
  },
];

export default function Demo() {
  return (
    <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-950 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-500">
            Features
          </p>
          <h2 className="mt-3 font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl text-2xl">
            Everything you need to ship
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Bento 布局用不等宽卡片建立视觉节奏，重点能力占据两列。
          </p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon, className }) => (
            <article
              key={title}
              className={`group relative overflow-hidden rounded-panel border border-zinc-200 bg-surface-0 p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 ${className}`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/0 blur-2xl transition-colors duration-500 group-hover:bg-emerald-500/15"
              />
              <Icon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
