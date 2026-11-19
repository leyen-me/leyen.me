const faqs = [
  {
    question: "Can I use these components in commercial projects?",
    answer:
      "可以。除特别标注外，本站作品以 MIT 许可发布，保留出处链接即可用于商业项目。",
  },
  {
    question: "Do I need Framer Motion?",
    answer:
      "只有部分区块使用 Framer Motion 做漂浮或淡入，其余组件均为纯 CSS 或原生 React 状态实现。",
  },
  {
    question: "How are blocks different from components?",
    answer:
      "Blocks 是整块页面区域，例如 Hero、Pricing；Components 是更小的可复用单元，例如按钮、输入框。",
  },
  {
    question: "Why is the preview isolated in an iframe?",
    answer:
      "区块可能包含全局样式或大面积背景，用 iframe 隔离能避免影响站点本身，同时保留真实的断点行为。",
  },
];

export default function Demo() {
  return (
    <section className="bg-white px-6 py-16 dark:bg-zinc-950 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl text-2xl">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          使用原生 <code className="font-mono text-[12px]">details</code>，
          无需 JavaScript 也能展开/收起。
        </p>

        <div className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:text-white dark:focus-visible:ring-offset-zinc-950 [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="relative grid h-6 w-6 shrink-0 place-items-center rounded-full border border-zinc-300 text-zinc-500 transition-transform duration-300 group-open:rotate-45 dark:border-zinc-700 dark:text-zinc-400"
                >
                  <span className="absolute h-px w-2.5 bg-current" />
                  <span className="absolute h-2.5 w-px bg-current" />
                </span>
              </summary>
              <p className="mt-3 pr-10 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
