import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume | Leyen",
  robots: "noindex, nofollow",
};

export default function ResumePage() {
  return (
    <main className="min-h-screen py-8 md:py-12 flex justify-center items-start px-4 print:py-0 print:px-0 print:min-h-0">
      {/* A4 纸张容器: 210mm x 297mm */}
      <article
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800"
        style={{
          width: "210mm",
          minHeight: "297mm",
        }}
      >
        <div className="p-10 md:p-12 print:p-10">
          {/* 头部区域 */}
          <header className="border-b border-zinc-200 pb-6 mb-6">
            <div className="space-y-1">
              {/* 姓名 */}
              <h1 className="text-2xl font-incognito font-semibold tracking-tight">
                {/* 姓名占位 */}
              </h1>
              {/* 职位/标题 */}
              <p className="text-zinc-500 text-sm">
                {/* 职位占位 */}
              </p>
            </div>
            {/* 联系方式 */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
              {/* 邮箱、电话、地址等占位 */}
            </div>
          </header>

          {/* 主体内容区域 */}
          <div className="space-y-8">
            {/* 教育经历 */}
            <section>
              <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                教育经历
              </h2>
              <div className="space-y-4">
                {/* 教育经历条目占位 */}
              </div>
            </section>

            {/* 工作经历 */}
            <section>
              <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                工作经历
              </h2>
              <div className="space-y-4">
                {/* 工作经历条目占位 */}
              </div>
            </section>

            {/* 项目经历 */}
            <section>
              <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                项目经历
              </h2>
              <div className="space-y-4">
                {/* 项目经历条目占位 */}
              </div>
            </section>

            {/* 技能 */}
            <section>
              <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                技能
              </h2>
              <div className="space-y-2">
                {/* 技能占位 */}
              </div>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
