import { defineField, defineType } from "sanity";
import { MdBook } from "react-icons/md";

const STATUS_OPTIONS = [
  { title: "学习中", value: "learning" },
  { title: "复习中", value: "review" },
  { title: "已掌握", value: "mastered" },
  { title: "生词本", value: "new_word_book" },
] as const;

const EXAMPLE_SOURCE_OPTIONS = [
  { title: "雅思", value: "ielts" },
  { title: "托福", value: "toefl" },
  { title: "电影", value: "movie" },
  { title: "通用", value: "general" },
] as const;

export const englishWord = defineType({
  name: "englishWord",
  title: "English Word",
  type: "document",
  icon: MdBook,
  fields: [
    defineField({
      name: "word",
      title: "单词",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "phonetic",
      title: "音标 (IPA)",
      type: "string",
    }),
    defineField({
      name: "partOfSpeech",
      title: "词性",
      type: "string",
    }),
    defineField({
      name: "meaningZh",
      title: "中文释义",
      type: "string",
    }),
    defineField({
      name: "phrases",
      title: "短语",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "phrase", title: "短语", type: "string" },
            { name: "meaningZh", title: "中文", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "examples",
      title: "例句",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "sentence", title: "例句", type: "string" },
            {
              name: "source",
              title: "来源",
              type: "string",
              options: { list: [...EXAMPLE_SOURCE_OPTIONS] },
            },
            { name: "translationZh", title: "中文翻译", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "derivations",
      title: "派生词",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "word", title: "单词", type: "string" },
            { name: "partOfSpeech", title: "词性", type: "string" },
            { name: "meaningZh", title: "中文", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "morphology",
      title: "词根词缀",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: "breakdown",
          title: "构词拆解",
          type: "string",
          description: "如 in-(不) + struct(建造) + -ion(名词后缀)",
        },
        {
          name: "parts",
          title: "词素拆解",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "type",
                  title: "类型",
                  type: "string",
                  options: {
                    list: [
                      { title: "前缀", value: "prefix" },
                      { title: "词根", value: "root" },
                      { title: "后缀", value: "suffix" },
                    ],
                  },
                },
                { name: "text", title: "词素", type: "string" },
                { name: "meaning", title: "含义", type: "string" },
              ],
            },
          ],
        },
        {
          name: "memoryTip",
          title: "串联记忆",
          type: "text",
          description: "用各词素含义串联出当前释义的记忆线索",
        },
      ],
    }),
    defineField({
      name: "level",
      title: "等级",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "学习状态",
      type: "string",
      options: { list: [...STATUS_OPTIONS] },
      initialValue: "learning",
    }),
    defineField({
      name: "srsInterval",
      title: "SRS 间隔（天）",
      type: "number",
      initialValue: 1,
    }),
    defineField({
      name: "nextReviewAt",
      title: "下次复习日期",
      type: "string",
    }),
    defineField({
      name: "consecutiveCorrect",
      title: "连续答对次数",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "wrongCount",
      title: "答错次数",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "learnedAt",
      title: "首次学习日期",
      type: "string",
    }),
    defineField({
      name: "lastReviewedAt",
      title: "上次复习日期",
      type: "string",
    }),
    defineField({
      name: "dailyBatchDate",
      title: "学习批次日期",
      type: "string",
    }),
    defineField({
      name: "cachedReviewQuiz",
      title: "缓存复习题",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: "type", title: "题型", type: "string" },
        { name: "prompt", title: "题干", type: "text" },
        { name: "answer", title: "答案", type: "string" },
        {
          name: "options",
          title: "选项",
          type: "array",
          of: [{ type: "string" }],
        },
      ],
    }),
    defineField({
      name: "cachedExamQuiz",
      title: "缓存考试题",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: "type", title: "题型", type: "string" },
        { name: "prompt", title: "题干", type: "text" },
        { name: "answer", title: "答案", type: "string" },
        {
          name: "options",
          title: "选项",
          type: "array",
          of: [{ type: "string" }],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "word", subtitle: "meaningZh", status: "status" },
    prepare({ title, subtitle, status }) {
      return {
        title: title || "Untitled",
        subtitle: [subtitle, status].filter(Boolean).join(" · "),
      };
    },
  },
});
