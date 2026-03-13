"use client";

import { useState } from "react";
import { resumeData } from "./data";
import { Template1 } from "./templates/Template1";
import { Template2 } from "./templates/Template2";

const TEMPLATES = [
  { id: "1", name: "模板 1", component: Template1 },
  { id: "2", name: "模板 2", component: Template2 },
] as const;

type TemplateId = (typeof TEMPLATES)[number]["id"];

export function ResumePageClient() {
  const [activeId, setActiveId] = useState<TemplateId>("1");

  const ActiveTemplate = TEMPLATES.find((t) => t.id === activeId)?.component ?? Template1;

  return (
    <main className="resume-page min-h-screen py-4 sm:py-8 md:py-12 flex flex-col items-center gap-4 sm:gap-6 px-2 sm:px-4 print:py-0 print:px-0 print:gap-4 print:min-h-0 overflow-x-hidden">
      {/* 模板切换 - 打印时隐藏 */}
      <div className="flex flex-wrap gap-2 print:hidden sticky top-4 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <span className="text-sm text-zinc-500 self-center mr-2">切换模板：</span>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeId === t.id
                ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <ActiveTemplate data={resumeData} />
    </main>
  );
}
