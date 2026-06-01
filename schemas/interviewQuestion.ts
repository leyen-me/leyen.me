import { defineField, defineType } from "sanity";
import { MdQuiz } from "react-icons/md";

const CATEGORY_OPTIONS = [
  { title: "HTML", value: "html" },
  { title: "CSS", value: "css" },
  { title: "JavaScript", value: "js" },
  { title: "TypeScript", value: "ts" },
  { title: "Vue", value: "vue" },
  { title: "React", value: "react" },
  { title: "浏览器原理", value: "browser-principle" },
  { title: "网络 & 通信", value: "network-communication" },
  { title: "性能优化", value: "performance-optimization" },
  { title: "工程化", value: "engineering" },
  { title: "算法 & 数据结构", value: "algorithm-data-structure" },
  { title: "前端架构", value: "frontend-architecture" },
  { title: "跨端 & 平台", value: "cross-platform" },
  { title: "测试", value: "test" },
  { title: "安全", value: "security" },
  { title: "AI", value: "ai" },
  { title: "Python", value: "python" },
  { title: "云原生", value: "cloud-native" },
  { title: "Node.js / 全栈方向", value: "nodejs-fullstack" },
  { title: "数据 & 后端基础", value: "data-backend-basic" },
  { title: "其他", value: "other" },
] as const;

export const interviewQuestion = defineType({
  name: "interviewQuestion",
  title: "Interview Question",
  type: "document",
  icon: MdQuiz,
  fields: [
    defineField({
      name: "title",
      title: "题目",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "分类",
      type: "string",
      options: {
        list: [...CATEGORY_OPTIONS],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "面试回答 (Markdown)",
      type: "text",
      description:
        "与博客正文相同：标准 Markdown（GFM）。自定义样式见 app/components/shared/markdown-components.tsx。",
      rows: 24,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "isPublished",
      title: "发布",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
    },
    prepare({ title, category }) {
      return {
        title: title || "Untitled",
        subtitle: category ?? "",
      };
    },
  },
  orderings: [
    {
      title: "Updated (newest)",
      name: "updatedDesc",
      by: [{ field: "_updatedAt", direction: "desc" }],
    },
    {
      title: "Created (newest)",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});
