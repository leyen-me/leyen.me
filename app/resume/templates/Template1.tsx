"use client";

import type { ResumeData } from "../data";
import { getAge, getWorkYears } from "../data";

function SkillBar({ name, level }: { name: string; level: number }) {
  const filled = Math.round((level / 100) * 5);
  return (
    <div className="flex items-center justify-between gap-3 mb-2.5 text-sm">
      <span className="text-zinc-700 font-medium shrink-0 w-24 sm:w-28 min-w-0">
        {name}
      </span>
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

export function Template1({ data }: { data: ResumeData }) {
  const {
    birthDate,
    header,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications,
  } = data;

  const contactItems = [
    { text: header.contact.email, label: "邮箱" },
    { text: header.contact.phone, label: "电话" },
    { text: header.contact.location, label: "地址" },
    { text: header.contact.website, label: "网站" },
    { text: header.contact.github, label: "GitHub" },
    { text: header.contact.linkedin, label: "领英" },
  ].filter((item) => item.text);

  return (
    <>
      {/* 第一页 */}
      <article className="resume-article w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col overflow-hidden relative">
        <div
          className="absolute -top-4 -left-4 sm:-top-8 sm:-left-8 origin-top-left pointer-events-none"
          style={{ transform: "rotate(-45deg)" }}
        >
          <span
            className="block text-[72px] sm:text-[100px] md:text-[140px] font-incognito font-black tracking-tighter leading-none select-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CV / RESUME
          </span>
        </div>

        <div className="flex-1 flex flex-col pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6 md:px-12 relative z-10">
          <header className="border-b border-zinc-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-incognito font-bold tracking-tight text-zinc-900">
              {header.name}
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium">
              {header.title}
            </p>
            {(birthDate || experience.length > 0 || header.status) && (
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

          <section className="mb-8">
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
              技能介绍
            </h2>
            <p className="text-zinc-600 text-[13px] leading-relaxed">
              {summary}
            </p>
          </section>

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
      <article className="resume-article w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col overflow-hidden relative print:break-before-page">
        <div
          className="absolute -top-4 -left-4 sm:-top-8 sm:-left-8 origin-top-left pointer-events-none"
          style={{ transform: "rotate(-45deg)" }}
        >
          <span
            className="block text-[72px] sm:text-[100px] md:text-[140px] font-incognito font-black tracking-tighter leading-none select-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CV / RESUME
          </span>
        </div>

        <div className="flex-1 flex flex-col pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6 md:px-12 relative z-10">
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

          <section className="mb-8">
            <h2 className="text-[10px] font-incognito font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Languages
            </h2>
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-12">
              <SkillBar name="中文" level={100} />
              <SkillBar name="English" level={85} />
            </div>
          </section>

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
    </>
  );
}
