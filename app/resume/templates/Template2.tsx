"use client";

import type { ResumeData } from "../data";

function getSkillLabel(level: number): string {
  if (level >= 85) return "Expert";
  if (level >= 60) return "Proficient";
  return "Novice";
}

export function Template2({ data }: { data: ResumeData }) {
  const { header, summary, education, experience, projects, skills } = data;

  const contactItems = [
    { text: header.contact.location, label: "地址" },
    { text: header.contact.email, label: "邮箱" },
    { text: header.contact.phone, label: "电话" },
    { text: header.contact.website || header.contact.github, label: "作品集" },
  ].filter((item) => item.text);

  return (
    <article className="resume-article w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col md:flex-row overflow-hidden">
      {/* 左侧主内容区 */}
      <div className="flex-1 flex flex-col pt-8 pb-8 px-6 md:px-8 min-w-0">
        {/* 标题区 */}
        <header className="mb-6">
          <p className="text-xs text-zinc-500 font-medium mb-1">{header.title}</p>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
            {header.name}
          </h1>
          <div className="h-px bg-zinc-300 mt-2 w-16" />
        </header>

        {/* Profile */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-zinc-900 mb-2">Profile</h2>
          <p className="text-[13px] text-zinc-600 leading-relaxed">{summary}</p>
        </section>

        {/* Education */}
        {education.some((e) => e.school && (e.dates || e.degree || e.major)) && (
          <section className="mb-6">
            <h2 className="text-sm font-bold text-zinc-900 mb-4">Education</h2>
            <div className="space-y-4">
              {education
                .filter((e) => e.school && (e.dates || e.degree || e.major))
                .map((edu, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-bold text-zinc-900 text-sm">
                        {edu.school}
                      </h3>
                      <span className="text-[11px] text-zinc-500 shrink-0">
                        {edu.dates}
                      </span>
                    </div>
                    <p className="text-[13px] text-zinc-600 mt-0.5">
                      {edu.degree}
                      {edu.major && `, ${edu.major}`}
                      {edu.gpa && `, GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Employment - 合并 experience 和 projects */}
        <section className="flex-1">
          <h2 className="text-sm font-bold text-zinc-900 mb-4">Employment</h2>
          <div className="space-y-5">
            {experience.map((exp, i) => (
              <div key={`exp-${i}`}>
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="font-bold text-zinc-900 text-sm">
                    {exp.role} at {exp.company}
                  </h3>
                  <span className="text-[11px] text-zinc-500 shrink-0">
                    {exp.dates}
                  </span>
                </div>
                {exp.bullets.length > 0 && (
                  <p className="text-[13px] text-zinc-600 mt-1 leading-relaxed">
                    {exp.bullets.join(" ")}
                  </p>
                )}
              </div>
            ))}
            {projects.map((proj, i) => (
              <div key={`proj-${i}`}>
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="font-bold text-zinc-900 text-sm">
                    {proj.name}
                    {proj.company && ` at ${proj.company}`}
                  </h3>
                  <span className="text-[11px] text-zinc-500 shrink-0">
                    {proj.dates}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-600 mt-1 leading-relaxed">
                  {proj.description}
                  {proj.responsibilities &&
                    proj.responsibilities.length > 0 &&
                    ` ${proj.responsibilities.join(" ")}`}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 右侧辅助信息栏 */}
      <aside className="md:w-[100mm] shrink-0 flex flex-col pt-6 md:pt-8 pb-8 px-6 border-t md:border-t-0 md:border-l border-zinc-200">
        {/* Contacts */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-zinc-900 mb-3">Contacts</h2>
          <div className="space-y-2">
            {contactItems.map(({ text, label }) => (
              <div key={label}>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-[13px] text-zinc-700 break-words">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills - 带进度条 */}
        <section>
          <h2 className="text-sm font-bold text-zinc-900 mb-3">Skills</h2>
          <div className="space-y-3">
            {skills.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between items-center gap-2 mb-1">
                  <span className="text-[13px] font-medium text-zinc-700">
                    {skill.name}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {getSkillLabel(skill.level)}
                  </span>
                </div>
                <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-800 rounded-full transition-all"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </article>
  );
}
