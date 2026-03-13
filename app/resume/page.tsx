import { Metadata } from "next";

export const metadata: Metadata = {
  title: "简历 | 雷光银",
  robots: "noindex, nofollow",
};

type Project = {
  name: string;
  description: string;
  tech: string;
  link?: string;
  bullets?: string[];
  company?: string;
  dates?: string;
  responsibilities?: string[];
  challenges?: string[];
  achievements?: string[];
};

type Header = {
  name: string;
  title: string;
  contact: Record<string, string>;
  status?: string;
};

function getAge(birthDate: string): number {
  const [year, month, day] = birthDate.split(".").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1;
  if (m < month || (m === month && today.getDate() < day)) age--;
  return age;
}

function getWorkYears(
  experience: { dates: string }[]
): string {
  const today = new Date();
  let totalMonths = 0;
  for (const exp of experience) {
    const [startStr, endStr] = exp.dates.split(" - ").map((s) => s.trim());
    if (!startStr || !endStr) continue;
    const [y1, m1] = startStr.split("/").map(Number);
    const start = new Date(y1, (m1 || 1) - 1, 1);
    const end =
      endStr === "至今"
        ? today
        : (() => {
            const [y2, m2] = endStr.split("/").map(Number);
            return new Date(y2, (m2 || 1) - 1, 1);
          })();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }
  const years = Math.floor(totalMonths / 12);
  return `${years}年`;
}

const resumeData = {
  birthDate: "1998.10.26",
  header: {
    name: "雷光银",
    title: "前端开发工程师",
    contact: {
      email: "672228275@qq.com",
      phone: "17608337515",
      location: "",
      website: "",
      github: "",
      linkedin: "",
    },
    status: "离职",
  } as Header,
  summary:
    "精通 Vue2、Vue3 生态开发，对 Vue2 核心原理有一定研究。精通 Html、Css、JavaScript、TypeScript、Scss/Less，熟悉 ES6+ 新特性。精通 Uniapp 框架、小程序开发，以及 Element、ElementPlus、AntDesign 等 UI 框架。精通 Git 项目管理工具，了解 React 基本使用。了解 Webpack 构建工具，包括基本配置及构建速度优化。了解 Gin、SpringBoot、Express、Koa2 等后端框架使用。了解 Docker 基本使用及服务器部署。",
  education: [
    {
      school: "西南交通大学",
      degree: "本科",
      major: "交通运营管理",
      dates: "2016 - 2019",
      gpa: "",
      highlights: [],
    },
  ],
  experience: [
    {
      company: "天津二维科技有限公司",
      role: "前端开发工程师",
      dates: "2022/12 - 至今",
      location: "天津",
      bullets: [],
    },
    {
      company: "广锋科技有限公司",
      role: "前端开发工程师",
      dates: "2020/02 - 2022/12",
      location: "四川",
      bullets: [],
    },
  ],
  projects: [
    {
      name: "全能工匠",
      description: "装修工人接单系统、商城系统",
      company: "广锋科技有限公司",
      dates: "2022/07 - 2022/12",
      tech: "Vue2, Vue3, uView, Uniapp, ElementPlus",
      link: "",
      bullets: [],
      responsibilities: [
        "承担项目技术选型、项目搭建与设计、基础组件与业务组件封装",
        "完成用户端首页模块、论坛模块、电商后台管理系统开发",
      ],
      challenges: [
        "keep-alive 缓存组件、vuex 持久化数据",
        "论坛评论模块递归组件设计",
        "使用反向代理解决开发环境跨域问题",
        "问答模块组件化开发，自定义实现 v-model",
        "工匠电商后台权限管理模块开发，基于 RBAC 权限模型动态路由，前后端分离权限认证，自定义指令 v-has 实现按钮组件级权限控制",
      ],
      achievements: [
        "优化第三方组件库，抽象公共业务逻辑与公共组件，重新定义适合公司的前端脚手架",
        "推广 Eslint 前端标准化代码规范",
        "新项目广泛采用函数式编程、Vue3+TypeScript+Pinia",
      ],
    },
    {
      name: "阳光物业",
      description: "物业缴费系统",
      company: "广峰科技有限公司",
      dates: "2022/04 - 2022/06",
      tech: "Vue3, ElementPlus, Pinia",
      link: "",
      bullets: [],
      responsibilities: [
        "使用 Vue3 进行项目搭建与开发，采用最新 setup 语法进行开发",
        "封装 H5 支付模块",
        "使用 mock 服务加速项目开发与测试",
        "使用 yarn 替代 npm 包管理器，了解 pnpm 包管理器",
        "使用 vite 替代 webpack 项目构建服务",
      ],
      challenges: [
        "用户数据导出 Excel 实现",
        "使用 echarts 实现用户缴费统计可视化",
        "使用事件委托优化项目列表性能",
      ],
      achievements: [
        "理解并推广 Vue3 生态，封装 Hooks 提升项目开发效率",
      ],
    },
    {
      name: "蜀道黑牛",
      description: "专业卖牛肉的商城系统",
      company: "广峰科技有限公司",
      dates: "2021/03 - 2021/06",
      tech: "Vue2, uView, Uniapp, Element",
      link: "",
      bullets: [],
      responsibilities: [
        "完成电商项目搭建、基础组件与业务组件封装",
        "使用 ApiPost 进行项目管理、mock 服务、API 服务",
        "高质量还原设计稿",
      ],
      challenges: [
        "项目页面分包优化、组件按需引入",
      ],
      achievements: [
        "根据项目体量提前判断是否分包，建立分包规范",
      ],
    },
  ] as Project[],
  skills: [
    { name: "Vue2 / Vue3", level: 90 },
    { name: "JavaScript / TypeScript", level: 88 },
    { name: "Uniapp / 小程序", level: 85 },
    { name: "HTML / CSS / Scss", level: 90 },
    { name: "Element / AntDesign", level: 85 },
    { name: "Git / Webpack", level: 80 },
  ],
  certifications: [] as { name: string; issuer: string; date: string }[],
};

function SkillBar({ name, level }: { name: string; level: number }) {
  const filled = Math.round((level / 100) * 5);
  return (
    <div className="flex items-center justify-between gap-3 mb-2.5 text-sm">
      <span className="text-zinc-700 font-medium shrink-0 w-24 sm:w-28 min-w-0">{name}</span>
      <div className="flex gap-0.5 flex-1 max-w-[100px] sm:max-w-[120px] shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 border border-zinc-300 ${
              i <= filled ? "bg-zinc-800" : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ResumePageContent() {
  const {
    birthDate,
    header,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications,
  } = resumeData;

  const contactItems = [
    { text: header.contact.email, label: "邮箱" },
    { text: header.contact.phone, label: "电话" },
    { text: header.contact.location, label: "地址" },
    { text: header.contact.website, label: "网站" },
    { text: header.contact.github, label: "GitHub" },
    { text: header.contact.linkedin, label: "领英" },
  ].filter((item) => item.text);

  return (
    <main className="resume-page min-h-screen py-4 sm:py-8 md:py-12 flex flex-col items-center gap-4 sm:gap-6 px-2 sm:px-4 print:py-0 print:px-0 print:gap-4 print:min-h-0 overflow-x-hidden">
      {/* 第一页 - 单栏垂直布局 */}
      <article
        className="resume-article w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col overflow-hidden relative"
      >
        <div
          className="absolute -top-4 -left-4 sm:-top-8 sm:-left-8 origin-top-left pointer-events-none"
          style={{ transform: "rotate(-45deg)" }}
        >
          <span
            className="block text-[72px] sm:text-[100px] md:text-[140px] font-incognito font-black tracking-tighter leading-none select-none"
            style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CV / RESUME
          </span>
        </div>

        <div className="flex-1 flex flex-col pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6 md:px-12 relative z-10">
          {/* 头部 */}
          <header className="border-b border-zinc-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-incognito font-bold tracking-tight text-zinc-900">
              {header.name}
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium">
              {header.title}
            </p>
            {(birthDate ||
              experience.length > 0 ||
              header.status) && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                {birthDate && <span>年龄：{getAge(birthDate)}</span>}
                {experience.length > 0 && (
                  <span>工作经验：{getWorkYears(experience)}</span>
                )}
                {header.status && <span>状态：{header.status}</span>}
              </div>
            )}
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-y-2 sm:gap-y-1 sm:gap-x-6 text-sm text-zinc-600">
              {contactItems.map(({ text, label }) => (
                <span key={label}>
                  <span className="text-zinc-400 text-xs uppercase tracking-wider mr-1">
                    {label}:
                  </span>
                  {text}
                </span>
              ))}
            </div>
          </header>

          {/* 技能介绍 */}
          <section className="mb-8">
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
              技能介绍
            </h2>
            <p className="text-zinc-600 text-[13px] leading-relaxed">
              {summary}
            </p>
          </section>

          {/* 教育经历 - 有完整信息时显示 */}
          {education.some((e) => e.school && (e.dates || e.degree || e.major)) && (
            <section className="mb-8">
              <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-5">
                Education
              </h2>
              <div className="relative">
                {education
                  .filter((e) => e.school && (e.dates || e.degree || e.major))
                  .map((edu, i) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 border border-zinc-400 rotate-45 bg-white" />
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4">
                        <div>
                          <h3 className="font-incognito font-semibold text-zinc-900">
                            {edu.school}
                          </h3>
                          <p className="text-zinc-500 text-sm mt-0.5">
                            {edu.degree} {edu.major && `· ${edu.major}`}
                          </p>
                        </div>
                        <span className="text-[11px] text-zinc-400 uppercase tracking-wider shrink-0">
                          {edu.dates}
                        </span>
                      </div>
                      {edu.gpa && (
                        <p className="text-zinc-500 text-sm mt-1">{edu.gpa}</p>
                      )}
                      {edu.highlights && edu.highlights.length > 0 && (
                        <ul className="mt-2 text-[13px] text-zinc-600 space-y-0.5">
                          {edu.highlights.map((h, j) => (
                            <li key={j}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* 工作经历 */}
          <section className="mb-8">
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-5">
              Experience
            </h2>
            <div className="relative">
              {experience.map((exp, i) => (
                <div key={i} className="relative pl-6 mb-6 last:mb-0">
                  <div className="absolute left-0 top-1.5 w-2 h-2 border border-zinc-400 rotate-45 bg-white" />
                  {i < experience.length - 1 && (
                    <div className="absolute left-[3px] top-6 bottom-0 w-px bg-zinc-200" />
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4">
                    <div>
                      <h3 className="font-incognito font-semibold text-zinc-900">
                        {exp.company}
                      </h3>
                      <p className="text-zinc-500 text-sm mt-0.5">
                        {exp.role} · {exp.location}
                      </p>
                    </div>
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider shrink-0">
                      {exp.dates}
                    </span>
                  </div>
                  <ul className="mt-2 text-[13px] text-zinc-600 leading-relaxed space-y-1">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>

      {/* 第二页 */}
      <article
        className="resume-article w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col overflow-hidden relative print:break-before-page"
      >
        <div
          className="absolute -top-4 -left-4 sm:-top-8 sm:-left-8 origin-top-left pointer-events-none"
          style={{ transform: "rotate(-45deg)" }}
        >
          <span
            className="block text-[72px] sm:text-[100px] md:text-[140px] font-incognito font-black tracking-tighter leading-none select-none"
            style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CV / RESUME
          </span>
        </div>

        <div className="flex-1 flex flex-col pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6 md:px-12 relative z-10">
          {/* 项目经历 */}
          <section className="mb-8">
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-5">
              Projects
            </h2>
            <div className="relative">
                {projects.map((proj, i) => (
                  <div key={i} className="relative pl-6 mb-6 last:mb-0">
                    <div className="absolute left-0 top-1.5 w-2 h-2 border border-zinc-400 rotate-45 bg-white" />
                    {i < projects.length - 1 && (
                      <div className="absolute left-[3px] top-6 bottom-0 w-px bg-zinc-200" />
                    )}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4">
                      <h3 className="font-incognito font-semibold text-zinc-900">
                        {proj.name}
                      </h3>
                      {(proj.link || proj.dates) && (
                        <span className="text-[11px] text-zinc-400 shrink-0">
                          {proj.company && `${proj.company} · `}
                          {proj.dates || proj.link}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 text-[13px] mt-1">
                      {proj.description}
                    </p>
                    <p className="text-zinc-400 text-[11px] mt-1">{proj.tech}</p>
                    {proj.responsibilities && proj.responsibilities.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                            工作职责
                          </span>
                          <ul className="mt-1 text-[13px] text-zinc-600 space-y-0.5">
                            {proj.responsibilities.map((b, j) => (
                              <li key={j}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {proj.challenges && proj.challenges.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                            遇到的挑战
                          </span>
                          <ul className="mt-1 text-[13px] text-zinc-600 space-y-0.5">
                            {proj.challenges.map((b, j) => (
                              <li key={j}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {proj.achievements && proj.achievements.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                            项目成果
                          </span>
                          <ul className="mt-1 text-[13px] text-zinc-600 space-y-0.5">
                            {proj.achievements.map((b, j) => (
                              <li key={j}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="mt-2 text-[13px] text-zinc-600 space-y-0.5">
                        {proj.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </section>

          {/* 技能 */}
          <section className="mb-8">
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Skills
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-12 gap-y-0">
              {skills.map((skill, i) => (
                <SkillBar key={i} name={skill.name} level={skill.level} />
              ))}
            </div>
          </section>

          {/* 语言 */}
          <section className="mb-8">
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Languages
            </h2>
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-12">
              <SkillBar name="中文" level={100} />
              <SkillBar name="English" level={85} />
            </div>
          </section>

          {/* 证书 - 有内容时显示 */}
          {certifications.length > 0 && (
            <section>
              <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-5">
                Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 text-[13px]"
                  >
                    <span className="font-medium text-zinc-700">
                      {cert.name}
                    </span>
                    <span className="text-zinc-500 text-sm">
                      {cert.issuer} · {cert.date}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  );
}

export default function ResumePage() {
  return <ResumePageContent />;
}
