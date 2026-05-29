import { defineField, defineType } from "sanity";
import { MdCalendarToday } from "react-icons/md";

export const englishDailyLog = defineType({
  name: "englishDailyLog",
  title: "English Daily Log",
  type: "document",
  icon: MdCalendarToday,
  fields: [
    defineField({
      name: "date",
      title: "日期",
      type: "string",
      description: "YYYY-MM-DD",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "wordsLearnedCount",
      title: "新学词数",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "reviewCount",
      title: "复习词数",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "examScore",
      title: "考试得分",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "activityLevel",
      title: "活跃度 (0-4)",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0).max(4),
    }),
    defineField({
      name: "completedSteps",
      title: "完成步骤",
      type: "object",
      fields: [
        { name: "review", title: "复习", type: "boolean", initialValue: false },
        { name: "learn", title: "新词学习", type: "boolean", initialValue: false },
        { name: "exam", title: "考试", type: "boolean", initialValue: false },
      ],
    }),
    defineField({
      name: "learnWordIndex",
      title: "新词学习进度",
      type: "number",
      description: "今日词表中当前学到第几个（0 起）",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "reviewWordIndex",
      title: "复习进度",
      type: "number",
      description: "待复习列表中当前复习到第几个（0 起）",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: { title: "date", subtitle: "activityLevel" },
    prepare({ title, subtitle }) {
      return { title: title || "Unknown", subtitle: `活跃度 ${subtitle ?? 0}` };
    },
  },
});
