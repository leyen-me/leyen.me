/** Sanity `interviewQuestion.category` values — keep in sync with schemas/interviewQuestion.ts */
export const INTERVIEW_CATEGORY_OPTIONS = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "js", label: "JavaScript" },
  { value: "ts", label: "TypeScript" },
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "browser-principle", label: "浏览器原理" },
  { value: "network-communication", label: "网络 & 通信" },
  { value: "performance-optimization", label: "性能优化" },
  { value: "engineering", label: "工程化" },
  { value: "algorithm-data-structure", label: "算法 & 数据结构" },
  { value: "frontend-architecture", label: "前端架构" },
  { value: "cross-platform", label: "跨端 & 平台" },
  { value: "test", label: "测试" },
  { value: "security", label: "安全" },
  { value: "ai", label: "AI" },
  { value: "python", label: "Python" },
  { value: "cloud-native", label: "云原生" },
  { value: "nodejs-fullstack", label: "Node.js / 全栈方向" },
  { value: "data-backend-basic", label: "数据 & 后端基础" },
  { value: "other", label: "其他" },
] as const;

export type InterviewCategoryValue =
  (typeof INTERVIEW_CATEGORY_OPTIONS)[number]["value"];

export function getInterviewCategoryLabel(
  value: InterviewCategoryValue | string
): string {
  const found = INTERVIEW_CATEGORY_OPTIONS.find((c) => c.value === value);
  return found?.label ?? value;
}
