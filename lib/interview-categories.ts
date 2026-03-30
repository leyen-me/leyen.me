/** Sanity `interviewQuestion.category` values — keep in sync with schemas/interviewQuestion.ts */
export const INTERVIEW_CATEGORY_OPTIONS = [
  { value: "html-css", label: "HTML & CSS" },
  { value: "js-ts", label: "JavaScript / TypeScript" },
  { value: "react", label: "React" },
  { value: "engineering", label: "工程化" },
  { value: "browser-network", label: "浏览器 / 网络 / 性能" },
] as const;

export type InterviewCategoryValue =
  (typeof INTERVIEW_CATEGORY_OPTIONS)[number]["value"];

export function getInterviewCategoryLabel(
  value: InterviewCategoryValue | string
): string {
  const found = INTERVIEW_CATEGORY_OPTIONS.find((c) => c.value === value);
  return found?.label ?? value;
}
