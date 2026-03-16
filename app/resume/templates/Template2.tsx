"use client";
import type { ResumeData } from "../data";
import { formatDateRange, getAge, getWorkYears } from "../data";

function getSkillLabel(level: number): string {
  if (level >= 85) return "Expert";
  if (level >= 60) return "Proficient";
  return "Novice";
}

const PROJECTS_FIRST_PAGE = 2; // 第一页有 Profile/Education/Employment，项目少放
const PROJECTS_PER_PAGE = 3; // 后续页每页约 2 个项目

export function Template2({
  data,
  showProjectDiamondLine = false,
  paginated = false,
}: {
  data: ResumeData;
  showProjectDiamondLine?: boolean;
  paginated?: boolean;
}) {
  const { header, summary, education, experience, projects, skills, skillsByCategory, openSourceProjects, birthDate } = data;

  const contactItems = [
    { text: header.contact.location, label: "地址" },
    { text: header.contact.email, label: "邮箱" },
    { text: header.contact.phone, label: "电话" },
    { text: header.contact.website, label: "网站", href: header.contact.website?.startsWith("http") ? header.contact.website : undefined },
    { text: header.contact.github, label: "GitHub", href: header.contact.github ? (header.contact.github.startsWith("http") ? header.contact.github : `https://github.com/${header.contact.github}`) : undefined },
  ].filter((item) => item.text);

  // 计算分页：第 1 页放 Profile + Education + Employment + 部分 Projects + Sidebar
  // 后续页放剩余 Projects
  const totalPages = paginated
    ? Math.max(
        1,
        projects.length <= PROJECTS_FIRST_PAGE
          ? 1
          : 1 + Math.ceil((projects.length - PROJECTS_FIRST_PAGE) / PROJECTS_PER_PAGE)
      )
    : 1;

  const renderPage = (pageIndex: number) => {
    const projectStart =
      pageIndex === 0 ? 0 : PROJECTS_FIRST_PAGE + (pageIndex - 1) * PROJECTS_PER_PAGE;
    const projectEnd =
      pageIndex === 0
        ? Math.min(PROJECTS_FIRST_PAGE, projects.length)
        : Math.min(projectStart + PROJECTS_PER_PAGE, projects.length);
    const pageProjects = projects.slice(projectStart, projectEnd);

    return (
      <article
        key={pageIndex}
        className="resume-article resume-page-a4 relative w-[210mm] h-[297mm] flex-shrink-0 bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none dark:bg-white dark:text-zinc-800 flex flex-col overflow-hidden print:break-after-page"
        style={{ aspectRatio: "210/297" }}
      >
        {/* Header - 每页都显示 */}
        <header className="shrink-0 border-b border-zinc-200 pt-8 pb-6 px-6 md:px-8 flex flex-col md:flex-row md:items-start md:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
              {header.name}
            </h1>
            <p className="text-xs text-zinc-500 font-medium mt-1 tracking-widest">{header.title}</p>
          </div>
          {header.titleEn && (
            <p className="text-xs text-zinc-500">{header.titleEn}</p>
          )}
        </header>

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* 左侧 */}
          <div className="flex-1 flex flex-col pt-6 pb-8 px-6 md:px-8 min-w-0 overflow-hidden">
            {/* 第 1 页：Profile, Education, Employment */}
            {pageIndex === 0 && (
              <>
                <section className="mb-6 shrink-0">
                  <h2 className="text-sm font-bold text-zinc-900 mb-2">Profile</h2>
                  <p className="text-[13px] text-zinc-600 leading-relaxed">{summary}</p>
                </section>

                {education.some((e) => e.school && (e.dates || e.degree || e.major)) && (
                  <section className="mb-6 shrink-0">
                    <h2 className="text-sm font-bold text-zinc-900 mb-4">Education</h2>
                    <div className="space-y-4">
                      {education
                        .filter((e) => e.school && (e.dates || e.degree || e.major))
                        .map((edu, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-baseline gap-2">
                              <h3 className="font-bold text-zinc-900 text-sm">{edu.school}</h3>
                              <span className="text-[11px] text-zinc-500 shrink-0">{edu.dates}</span>
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

                <section className="mb-6 shrink-0">
                  <h2 className="text-sm font-bold text-zinc-900 mb-4">Employment</h2>
                  <div className="space-y-4">
                    {experience.map((exp, i) => (
                      <div key={`exp-${i}`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2">
                          <h3 className="font-bold text-zinc-900 text-sm">{exp.company}</h3>
                          <span className="text-[11px] text-zinc-500 shrink-0">
                            {formatDateRange(exp.dates)}
                          </span>
                        </div>
                        <p className="text-[12px] text-zinc-500 mt-0.5">{exp.role}</p>
                        {exp.bullets.length > 0 && (
                          <p className="text-[13px] text-zinc-600 mt-1 leading-relaxed">
                            {exp.bullets.join(" ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Projects - 每页显示对应区间的项目 */}
            <section className={`flex-1 pt-6 ${pageIndex === 0 ? "border-t border-zinc-200" : ""} min-h-0 overflow-hidden`}>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 shrink-0">Projects</h2>
              <div className="relative overflow-hidden min-h-0">
                {pageProjects.map((proj, i) => (
                  <div
                    key={`proj-${projectStart + i}`}
                    className={`relative mb-6 last:mb-0 ${showProjectDiamondLine ? "pl-6" : ""}`}
                  >
                    {showProjectDiamondLine && (
                      <>
                        <div className="absolute left-0 top-1.5 w-2 h-2 border border-zinc-400 rotate-45 bg-white" />
                        {projectStart + i < projects.length - 1 && (
                          <div className="absolute left-[3px] top-6 bottom-0 w-px bg-zinc-200" />
                        )}
                      </>
                    )}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2">
                      <h3 className="font-bold text-zinc-900 text-sm">{proj.name}</h3>
                      <span className="text-[11px] text-zinc-500 shrink-0">
                        {proj.dates ? formatDateRange(proj.dates) : ""}
                      </span>
                    </div>
                    {proj.company && (
                      <p className="text-[12px] text-zinc-500 mt-0.5">{proj.company}</p>
                    )}
                    <p className="text-[13px] text-zinc-600 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                    {proj.responsibilities && proj.responsibilities.length > 0 && (
                      <ul className="mt-2 space-y-1 text-[13px] text-zinc-600 leading-relaxed list-disc pl-4">
                        {proj.responsibilities.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 右侧辅助信息栏 - 每页都显示 */}
          <aside className="md:w-[70mm] shrink-0 flex flex-col pt-6 md:pt-8 pb-8 px-4 md:px-5 border-t md:border-t-0 md:border-l border-zinc-200">
              {(birthDate || experience.length > 0 || header.status) && (
                <section className="mb-6">
                  <h2 className="text-sm font-bold text-zinc-900 mb-3">About</h2>
                  <div className="space-y-1.5 text-[13px] text-zinc-600">
                    {birthDate && <p>年龄：{getAge(birthDate)}</p>}
                    {experience.length > 0 && <p>工作经验：{getWorkYears(experience)}</p>}
                    {header.status && <p>状态：{header.status}</p>}
                  </div>
                </section>
              )}

              <section className="mb-6">
                <h2 className="text-sm font-bold text-zinc-900 mb-3">Contacts</h2>
                <div className="space-y-2">
                  {contactItems.map(({ text, label, href }) => (
                    <div key={label}>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-zinc-700 break-words hover:text-zinc-900 hover:underline underline-offset-2"
                        >
                          {text}
                        </a>
                      ) : (
                        <p className="text-[13px] text-zinc-700 break-words">{text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-6">
                <h2 className="text-sm font-bold text-zinc-900 mb-3">Skills</h2>
                {skillsByCategory && skillsByCategory.length > 0 ? (
                  <div className="space-y-4">
                    {skillsByCategory.map((cat, i) => (
                      <div key={i}>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                          {cat.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.items.map((item, j) => (
                            <span
                              key={j}
                              className="inline-block px-2 py-0.5 text-[11px] text-zinc-600 bg-zinc-100 rounded border border-zinc-200"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {skills.map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center gap-2 mb-1">
                          <span className="text-[13px] font-medium text-zinc-700">{skill.name}</span>
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
                )}
              </section>

              {openSourceProjects && openSourceProjects.length > 0 && (
                <section className="pt-6 border-t border-zinc-200">
                  <h2 className="text-sm font-bold text-zinc-900 mb-3">Open Source</h2>
                  <div className="space-y-3">
                    {openSourceProjects.map((item, i) => (
                      <div key={i}>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium text-zinc-700 hover:text-zinc-900 hover:underline underline-offset-2 block"
                        >
                          {item.name}
                        </a>
                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
        </div>

        {/* 页码 - 右下角 */}
        {totalPages > 1 && (
          <p className="absolute bottom-4 right-6 text-xs text-zinc-400">
            {pageIndex + 1} / {totalPages}
          </p>
        )}
      </article>
    );
  };

  if (paginated) {
    return (
      <div className="resume-paginated flex flex-col items-center w-full max-w-[210mm]">
        {Array.from({ length: totalPages }, (_, i) => (
          <div
            key={i}
            className={i > 0 ? "mt-6 print:mt-0" : ""}
          >
            {renderPage(i)}
          </div>
        ))}
      </div>
    );
  }

  // 非分页模式：保持原有单页展示
  return (
    <article className="resume-article w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-800 shadow-lg print:shadow-none print:max-w-none print:overflow-visible dark:bg-white dark:text-zinc-800 flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-zinc-200 pt-8 pb-6 px-6 md:px-8 flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
            {header.name}
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-1 tracking-widest">{header.title}</p>
        </div>
        {header.titleEn && (
          <p className="text-xs text-zinc-500">{header.titleEn}</p>
        )}
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div className="flex-1 flex flex-col pt-6 pb-8 px-6 md:px-8 min-w-0">
          <section className="mb-6">
            <h2 className="text-sm font-bold text-zinc-900 mb-2">Profile</h2>
            <p className="text-[13px] text-zinc-600 leading-relaxed">{summary}</p>
          </section>

          {education.some((e) => e.school && (e.dates || e.degree || e.major)) && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-zinc-900 mb-4">Education</h2>
              <div className="space-y-4">
                {education
                  .filter((e) => e.school && (e.dates || e.degree || e.major))
                  .map((edu, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-bold text-zinc-900 text-sm">{edu.school}</h3>
                        <span className="text-[11px] text-zinc-500 shrink-0">{edu.dates}</span>
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

          <section className="mb-6">
            <h2 className="text-sm font-bold text-zinc-900 mb-4">Employment</h2>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={`exp-${i}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2">
                    <h3 className="font-bold text-zinc-900 text-sm">{exp.company}</h3>
                    <span className="text-[11px] text-zinc-500 shrink-0">
                      {formatDateRange(exp.dates)}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-0.5">{exp.role}</p>
                  {exp.bullets.length > 0 && (
                    <p className="text-[13px] text-zinc-600 mt-1 leading-relaxed">
                      {exp.bullets.join(" ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="flex-1 pt-6 border-t border-zinc-200">
            <h2 className="text-sm font-bold text-zinc-900 mb-4">Projects</h2>
            <div className="relative">
              {projects.map((proj, i) => (
                <div
                  key={`proj-${i}`}
                  className={`relative mb-6 last:mb-0 ${showProjectDiamondLine ? "pl-6" : ""}`}
                >
                  {showProjectDiamondLine && (
                    <>
                      <div className="absolute left-0 top-1.5 w-2 h-2 border border-zinc-400 rotate-45 bg-white" />
                      {i < projects.length - 1 && (
                        <div className="absolute left-[3px] top-6 bottom-0 w-px bg-zinc-200" />
                      )}
                    </>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2">
                    <h3 className="font-bold text-zinc-900 text-sm">{proj.name}</h3>
                    <span className="text-[11px] text-zinc-500 shrink-0">
                      {proj.dates ? formatDateRange(proj.dates) : ""}
                    </span>
                  </div>
                  {proj.company && (
                    <p className="text-[12px] text-zinc-500 mt-0.5">{proj.company}</p>
                  )}
                  <p className="text-[13px] text-zinc-600 mt-1 leading-relaxed">
                    {proj.description}
                  </p>
                  {proj.responsibilities && proj.responsibilities.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[13px] text-zinc-600 leading-relaxed list-disc pl-4">
                      {proj.responsibilities.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="md:w-[70mm] shrink-0 flex flex-col pt-6 md:pt-8 pb-8 px-4 md:px-5 border-t md:border-t-0 md:border-l border-zinc-200">
          {(birthDate || experience.length > 0 || header.status) && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-zinc-900 mb-3">About</h2>
              <div className="space-y-1.5 text-[13px] text-zinc-600">
                {birthDate && <p>年龄：{getAge(birthDate)}</p>}
                {experience.length > 0 && <p>工作经验：{getWorkYears(experience)}</p>}
                {header.status && <p>状态：{header.status}</p>}
              </div>
            </section>
          )}

          <section className="mb-6">
            <h2 className="text-sm font-bold text-zinc-900 mb-3">Contacts</h2>
            <div className="space-y-2">
              {contactItems.map(({ text, label, href }) => (
                <div key={label}>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-zinc-700 break-words hover:text-zinc-900 hover:underline underline-offset-2"
                    >
                      {text}
                    </a>
                  ) : (
                    <p className="text-[13px] text-zinc-700 break-words">{text}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-sm font-bold text-zinc-900 mb-3">Skills</h2>
            {skillsByCategory && skillsByCategory.length > 0 ? (
              <div className="space-y-4">
                {skillsByCategory.map((cat, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                      {cat.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item, j) => (
                        <span
                          key={j}
                          className="inline-block px-2 py-0.5 text-[11px] text-zinc-600 bg-zinc-100 rounded border border-zinc-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {skills.map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className="text-[13px] font-medium text-zinc-700">{skill.name}</span>
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
            )}
          </section>

          {openSourceProjects && openSourceProjects.length > 0 && (
            <section className="pt-6 border-t border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-900 mb-3">Open Source</h2>
              <div className="space-y-3">
                {openSourceProjects.map((item, i) => (
                  <div key={i}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-medium text-zinc-700 hover:text-zinc-900 hover:underline underline-offset-2 block"
                    >
                      {item.name}
                    </a>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}
