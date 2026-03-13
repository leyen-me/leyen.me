import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume | Leyen",
  robots: "noindex, nofollow",
};

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
  skills: [
    { name: "JavaScript / TypeScript", level: 90 },
    { name: "React / Next.js", level: 88 },
    { name: "Node.js", level: 75 },
    { name: "HTML / CSS", level: 85 },
    { name: "UI/UX 设计", level: 80 },
    { name: "Git", level: 85 },
  ],
  certifications: [
    { name: "某某认证", issuer: "某某机构", date: "2023" },
  ],
};

function SkillBar({ name, level }: { name: string; level: number }) {
  const filled = Math.round((level / 100) * 5);
  return (
    <div className="flex items-center justify-between gap-3 mb-2.5 text-sm">
      <span className="text-zinc-700 font-medium shrink-0 w-28">{name}</span>
      <div className="flex gap-0.5 flex-1 max-w-[120px]">
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
    header,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications,
  } = resumeData;

  const contactItems = [
    { text: header.contact.email, label: "Email" },
    { text: header.contact.phone, label: "Phone" },
    { text: header.contact.location, label: "Address" },
    { text: header.contact.website, label: "Website" },
    { text: header.contact.github, label: "GitHub" },
    { text: header.contact.linkedin, label: "LinkedIn" },
  ];

  return (
    <main className="resume-page min-h-screen py-8 md:py-12 flex flex-col items-center gap-6 px-4 print:py-0 print:px-0 print:gap-4 print:min-h-0">
      {/* 第一页 - 单栏垂直布局 */}
      <article
        className="resume-article w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col overflow-hidden relative"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div
          className="absolute -top-4 -left-4 origin-top-left"
          style={{ transform: "rotate(-45deg)" }}
        >
          <span className="text-[64px] font-incognito font-black tracking-tighter text-zinc-200/90 leading-none select-none">
            CV / RESUME
          </span>
        </div>

        <div className="flex-1 flex flex-col pt-12 pb-10 px-6 md:px-12 relative z-10">
          {/* 头部 */}
          <header className="border-b border-zinc-200 pb-6 mb-6">
            <h1 className="text-2xl font-incognito font-bold tracking-tight text-zinc-900">
              {header.name}
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium">
              {header.title}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
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

          {/* 个人简介 */}
          <section className="mb-8">
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Profile Info
            </h2>
            <p className="text-zinc-600 text-[13px] leading-relaxed">
              {summary}
            </p>
          </section>

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
                  <div className="flex justify-between items-baseline gap-4">
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

          {/* 教育经历 */}
          <section>
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-5">
              Education
            </h2>
            <div className="relative">
              {education.map((edu, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-2 h-2 border border-zinc-400 rotate-45 bg-white" />
                  <div className="flex justify-between items-baseline gap-4">
                    <div>
                      <h3 className="font-incognito font-semibold text-zinc-900">
                        {edu.school}
                      </h3>
                      <p className="text-zinc-500 text-sm mt-0.5">
                        {edu.degree} · {edu.major}
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
        </div>
      </article>

      {/* 第二页 */}
      <article
        className="resume-article w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col overflow-hidden relative print:break-before-page"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div
          className="absolute -top-4 -left-4 origin-top-left"
          style={{ transform: "rotate(-45deg)" }}
        >
          <span className="text-[64px] font-incognito font-black tracking-tighter text-zinc-200/90 leading-none select-none">
            CV / RESUME
          </span>
        </div>

        <div className="flex-1 flex flex-col pt-12 pb-10 px-6 md:px-12 relative z-10">
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
                  <div className="flex justify-between items-baseline gap-4">
                    <h3 className="font-incognito font-semibold text-zinc-900">
                      {proj.name}
                    </h3>
                    {proj.link && (
                      <span className="text-[11px] text-zinc-400 shrink-0">
                        {proj.link}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-600 text-[13px] mt-1">
                    {proj.description}
                  </p>
                  <p className="text-zinc-400 text-[11px] mt-1">{proj.tech}</p>
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
            <div className="grid grid-cols-2 gap-x-12 gap-y-0">
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
            <div className="flex gap-12">
              <SkillBar name="中文" level={100} />
              <SkillBar name="English" level={85} />
            </div>
          </section>

          {/* 证书 */}
          <section>
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-5">
              Certifications
            </h2>
            <div className="space-y-2">
              {certifications.map((cert, i) => (
                <div
                  key={i}
                  className="flex justify-between items-baseline text-[13px]"
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
        </div>
      </article>
    </main>
  );
}

export default function ResumePage() {
  return <ResumePageContent />;
}
