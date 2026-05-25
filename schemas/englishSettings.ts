import { defineField, defineType } from "sanity";
import { MdSchool } from "react-icons/md";

const LEVEL_OPTIONS = [
  { title: "A1 零基础", value: "A1" },
  { title: "A2 初级", value: "A2" },
  { title: "B1 中级", value: "B1" },
  { title: "B2 中高级", value: "B2" },
  { title: "C1 高级", value: "C1" },
  { title: "C2 精通", value: "C2" },
  { title: "雅思", value: "ielts" },
  { title: "托福", value: "toefl" },
] as const;

const TARGET_EXAM_OPTIONS = [
  { title: "无特定目标", value: "none" },
  { title: "雅思", value: "ielts" },
  { title: "托福", value: "toefl" },
] as const;

export const englishSettings = defineType({
  name: "englishSettings",
  title: "English Settings",
  type: "document",
  icon: MdSchool,
  fields: [
    defineField({
      name: "currentLevel",
      title: "当前等级",
      type: "string",
      options: { list: [...LEVEL_OPTIONS] },
      initialValue: "A1",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "targetExam",
      title: "目标考试",
      type: "string",
      options: { list: [...TARGET_EXAM_OPTIONS] },
      initialValue: "none",
    }),
    defineField({
      name: "dailyWordCount",
      title: "每日新词数量",
      type: "number",
      initialValue: 20,
      validation: (Rule) => Rule.required().min(1).max(50),
    }),
    defineField({
      name: "masteredThreshold",
      title: "掌握阈值（连续答对次数）",
      type: "number",
      initialValue: 3,
      validation: (Rule) => Rule.required().min(1).max(10),
    }),
    defineField({
      name: "lastStudyDate",
      title: "上次学习日期",
      type: "string",
    }),
    defineField({
      name: "currentStreak",
      title: "连续打卡天数",
      type: "number",
      initialValue: 0,
    }),
  ],
});
