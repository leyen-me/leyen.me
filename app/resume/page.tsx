import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume | Leyen",
  robots: "noindex, nofollow",
};

// Mock 数据，后续可替换为真实内容
const resumeData = {
  header: {
    name: "Leyen",
    title: "Software Developer / Full-Stack Engineer",
    contact: {
      email: "hello@leyen.me",
      phone: "+86 138 xxxx xxxx",
      location: "Shanghai, China",
      website: "leyen.me",
      github: "github.com/leyen",
      linkedin: "linkedin.com/in/leyen",
    },
  },
  summary:
    "Full-stack developer with X years of experience. Passionate about building products that users love. Strong in React, Next.js, Node.js. Former UI designer with keen eye for detail.",
  education: [
    {
      school: "某某大学",
      degree: "本科",
      major: "计算机科学与技术",
      dates: "2016 - 2020",
      gpa: "GPA 3.8/4.0",
      highlights: ["奖学金", "相关课程项目"],
    },
  ],
  experience: [
    {
      company: "某某科技公司",
      role: "Senior Frontend Engineer",
      dates: "2022 - 至今",
      location: "上海",
      bullets: [
        "负责核心产品的前端架构设计与开发",
        "主导组件库建设，提升团队开发效率 30%",
        "与设计、产品协作，推动用户体验优化",
      ],
    },
    {
      company: "某某互联网公司",
      role: "Frontend Developer",
      dates: "2020 - 2022",
      location: "上海",
      bullets: [
        "参与多个 B 端、C 端项目的前端开发",
        "使用 React + TypeScript 构建可维护的代码库",
        "参与技术分享与 Code Review",
      ],
    },
    {
      company: "某某创业公司",
      role: "UI Designer / Frontend Developer",
      dates: "2019 - 2020",
      location: "上海",
      bullets: [
        "负责产品 UI 设计与前端实现",
        "从 0 到 1 搭建产品界面与设计规范",
      ],
    },
  ],
  projects: [
    {
      name: "leyen.me",
      description: "个人网站，使用 Next.js、Sanity CMS 构建",
      tech: "Next.js, React, Sanity, Tailwind CSS",
      link: "leyen.me",
      bullets: ["博客、项目展示、电影记录等模块"],
    },
    {
      name: "某某开源项目",
      description: "项目简短描述",
      tech: "React, Node.js",
      link: "",
      bullets: ["功能点 1", "功能点 2"],
    },
  ],
  skills: {
    languages: ["JavaScript / TypeScript", "HTML / CSS"],
    frontend: ["React", "Next.js", "Tailwind CSS", "Framer Motion"],
    backend: ["Node.js", "REST API"],
    tools: ["Git", "Figma", "VS Code"],
    other: ["UI/UX 设计", "响应式设计"],
  },
  certifications: [
    { name: "某某认证", issuer: "某某机构", date: "2023" },
  ],
};

function ResumePageContent() {
  const { header, summary, education, experience, projects, skills, certifications } = resumeData;

  return (
    <main className="min-h-screen py-8 md:py-12 flex flex-col items-center gap-6 px-4 print:py-0 print:px-0 print:gap-4 print:min-h-0">
      {/* 第一页 */}
      <article
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div className="p-10 md:p-12 print:p-10 flex-1 flex flex-col">
          {/* 头部 */}
          <header className="border-b border-zinc-200 pb-6 mb-6">
            <h1 className="text-2xl font-incognito font-semibold tracking-tight">
              {header.name}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">{header.title}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
              <span>{header.contact.email}</span>
              <span>{header.contact.phone}</span>
              <span>{header.contact.location}</span>
              <span>{header.contact.website}</span>
              <span>{header.contact.github}</span>
              <span>{header.contact.linkedin}</span>
            </div>
          </header>

          {/* 个人简介 */}
          <section className="mb-6">
            <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              个人简介
            </h2>
            <p className="text-zinc-700 text-sm leading-relaxed">{summary}</p>
          </section>

          {/* 教育经历 */}
          <section className="mb-6">
            <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              教育经历
            </h2>
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <h3 className="font-incognito font-medium">{edu.school}</h3>
                      <p className="text-sm text-zinc-600">
                        {edu.degree} · {edu.major}
                      </p>
                    </div>
                    <span className="text-sm text-zinc-500">{edu.dates}</span>
                  </div>
                  {edu.gpa && (
                    <p className="text-sm text-zinc-500 mt-1">{edu.gpa}</p>
                  )}
                  {edu.highlights && edu.highlights.length > 0 && (
                    <ul className="mt-2 text-sm text-zinc-600 list-disc list-inside">
                      {edu.highlights.map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 工作经历 */}
          <section className="flex-1">
            <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              工作经历
            </h2>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <h3 className="font-incognito font-medium">{exp.company}</h3>
                      <p className="text-sm text-zinc-600">
                        {exp.role} · {exp.location}
                      </p>
                    </div>
                    <span className="text-sm text-zinc-500">{exp.dates}</span>
                  </div>
                  <ul className="mt-2 text-sm text-zinc-600 list-disc list-inside space-y-1">
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

      {/* 第二页 - 打印时强制换页 */}
      <article
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col print:break-before-page"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div className="p-10 md:p-12 print:p-10 flex-1 flex flex-col">
          {/* 项目经历 */}
          <section className="mb-6">
            <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              项目经历
            </h2>
            <div className="space-y-4">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-incognito font-medium">{proj.name}</h3>
                    {proj.link && (
                      <span className="text-sm text-zinc-500">{proj.link}</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 mt-1">{proj.description}</p>
                  <p className="text-xs text-zinc-500 mt-1">{proj.tech}</p>
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="mt-2 text-sm text-zinc-600 list-disc list-inside">
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
          <section className="mb-6">
            <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              技能
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-zinc-600">
              {(
                [
                  ["编程语言", skills.languages],
                  ["前端", skills.frontend],
                  ["后端", skills.backend],
                  ["工具", skills.tools],
                  ["其他", skills.other],
                ] as [string, string[]][]
              ).map(([label, items]) => (
                <div key={label}>
                  <span className="font-medium text-zinc-700">{label}:</span>{" "}
                  {items.join(", ")}
                </div>
              ))}
            </div>
          </section>

          {/* 证书 / 荣誉 */}
          <section>
            <h2 className="text-sm font-incognito font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              证书与荣誉
            </h2>
            <div className="space-y-2">
              {certifications.map((cert, i) => (
                <div key={i} className="flex justify-between items-baseline text-sm">
                  <span className="font-medium">{cert.name}</span>
                  <span className="text-zinc-500">
                    {cert.issuer} · {cert.date}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}

export default function ResumePage() {
  return <ResumePageContent />;
}
