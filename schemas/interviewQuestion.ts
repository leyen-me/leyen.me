import { defineField, defineType } from "sanity";
import { MdQuiz } from "react-icons/md";

const CATEGORY_OPTIONS = [
  { title: "HTML & CSS", value: "html-css" },
  { title: "JavaScript / TypeScript", value: "js-ts" },
  { title: "React", value: "react" },
  { title: "工程化", value: "engineering" },
  { title: "浏览器 / 网络 / 性能", value: "browser-network" },
] as const;

export const interviewQuestion = defineType({
  name: "interviewQuestion",
  title: "Interview Question",
  type: "document",
  icon: MdQuiz,
  fields: [
    defineField({
      name: "title",
      title: "题目标题",
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
      name: "excerpt",
      title: "一句话摘要",
      type: "text",
      rows: 2,
      description: "列表卡片上显示",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "主分类",
      type: "string",
      options: {
        list: [...CATEGORY_OPTIONS],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "标签",
      type: "array",
      of: [
        {
          type: "string",
          validation: (Rule) => Rule.required().min(1),
        },
      ],
      options: { layout: "tags" },
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: "isPublished",
      title: "发布",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "isFromWork",
      title: "来自真实工作问题",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "shortAnswer",
      title: "短答案（面试约 30 秒）",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "body",
      title: "展开说明",
      type: "blockContent",
    }),
    defineField({
      name: "workScenario",
      title: "真实场景",
      type: "text",
      rows: 4,
      description: "这题为什么会出现在工作里",
    }),
    defineField({
      name: "followUps",
      title: "追问",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "relatedQuestions",
      title: "相关题",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "interviewQuestion" }],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      tags: "tags",
    },
    prepare({ title, category, tags }) {
      return {
        title: title || "Untitled",
        subtitle: [category, tags?.join(", ")].filter(Boolean).join(" · "),
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
