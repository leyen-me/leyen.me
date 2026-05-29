import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiModel } from "@/lib/admin/ai/config";

const polishModeSchema = z.enum(["light", "deep", "styled"]);

const polishInputSchema = z.object({
  action: z.literal("polish"),
  mode: polishModeSchema.default("light"),
  title: z.string().trim().min(1, "Title is required"),
  selection: z.string().trim().min(1, "Selection is required"),
  before: z.string().optional(),
  after: z.string().optional(),
});

const continueInputSchema = z.object({
  action: z.literal("continue"),
  title: z.string().trim().min(1, "Title is required"),
  before: z.string(),
  after: z.string().optional(),
});

const translateInputSchema = z.object({
  action: z.literal("translate"),
  title: z.string().trim().min(1, "Title is required"),
  selection: z.string().trim().min(1, "Selection is required"),
  before: z.string().optional(),
  after: z.string().optional(),
});

export const postContentInputSchema = z.discriminatedUnion("action", [
  polishInputSchema,
  continueInputSchema,
  translateInputSchema,
]);

export type PostContentInput = z.infer<typeof postContentInputSchema>;
type PostPolishMode = z.infer<typeof polishModeSchema>;

const SYSTEM_PROMPT = [
  "You are a blog writing assistant.",
  "Output Markdown only — no explanations, no code fences wrapping the whole response.",
  "Keep the same language as the source text (Chinese stays Chinese, English stays English).",
  "Preserve Markdown structure: headings, lists, links, code blocks, and inline formatting.",
].join("\n");

function stripMarkdownFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```$/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

function countParagraphs(text: string): number {
  return text.trim().split(/\n\s*\n/).filter(Boolean).length;
}

function polishMaxTokens(selection: string, mode: PostPolishMode): number {
  const charCount = selection.trim().length;
  const multiplier = mode === "light" ? 1.5 : 2;
  const cap = mode === "light" ? 1024 : 1280;
  return Math.min(cap, Math.max(160, Math.ceil(charCount * multiplier)));
}

function buildPolishUserPrompt(input: {
  mode: PostPolishMode;
  title: string;
  selection: string;
  before?: string;
  after?: string;
}): string {
  const sections = [
    "<ARTICLE_TITLE>",
    input.title,
    "</ARTICLE_TITLE>",
    "",
    "<REFERENCE_CONTEXT_BEFORE>",
    input.before?.trim() || "(empty)",
    "</REFERENCE_CONTEXT_BEFORE>",
    "",
    "<SELECTED_TEXT>",
    input.selection.trim(),
    "</SELECTED_TEXT>",
    "",
    "<REFERENCE_CONTEXT_AFTER>",
    input.after?.trim() || "(empty)",
    "</REFERENCE_CONTEXT_AFTER>",
  ];

  if (input.mode === "styled") {
    sections.push(
      "",
      "<STYLE_PROFILE>",
      [
        "Write in a crisp, analytical long-form column style.",
        "Lead with the key point early.",
        "Use concrete wording and tighter rhythm.",
        "Stay confident and sharp, but not sensational or preachy.",
        "Prefer high signal density over filler phrasing.",
      ].join("\n"),
      "</STYLE_PROFILE>"
    );
  }

  return sections.join("\n");
}

function buildTranslateUserPrompt(input: {
  title: string;
  selection: string;
  before?: string;
  after?: string;
}): string {
  return [
    "<ARTICLE_TITLE>",
    input.title,
    "</ARTICLE_TITLE>",
    "",
    "<REFERENCE_CONTEXT_BEFORE>",
    input.before?.trim() || "(empty)",
    "</REFERENCE_CONTEXT_BEFORE>",
    "",
    "<SELECTED_TEXT>",
    input.selection.trim(),
    "</SELECTED_TEXT>",
    "",
    "<REFERENCE_CONTEXT_AFTER>",
    input.after?.trim() || "(empty)",
    "</REFERENCE_CONTEXT_AFTER>",
  ].join("\n");
}

function buildContinueUserPrompt(input: {
  title: string;
  before: string;
  after?: string;
}): string {
  return [
    "<ARTICLE_TITLE>",
    input.title,
    "</ARTICLE_TITLE>",
    "",
    "<TEXT_BEFORE_CURSOR>",
    input.before || "(empty)",
    "</TEXT_BEFORE_CURSOR>",
    "",
    "<TEXT_AFTER_CURSOR>",
    input.after || "(empty)",
    "</TEXT_AFTER_CURSOR>",
  ].join("\n");
}

const POLISH_PROMPTS: Record<PostPolishMode, string> = {
  light: [
    SYSTEM_PROMPT,
    "You are lightly editing a selected passage from a blog post.",
    "Rewrite <SELECTED_TEXT> only.",
    "Read <REFERENCE_CONTEXT_BEFORE> and <REFERENCE_CONTEXT_AFTER> only for tone and continuity.",
    "Do not change facts, meaning, or viewpoint.",
    "Preserve Markdown formatting.",
    "Keep the same structure: same number of paragraphs, headings, and list items.",
    "Prefer local edits and faithful wording improvements.",
    "Do not add new paragraphs, sections, bullet points, examples, transitions, or conclusions.",
    "Do not output, repeat, summarize, paraphrase, or continue any text from <REFERENCE_CONTEXT_BEFORE> or <REFERENCE_CONTEXT_AFTER>.",
    "Return ONLY the rewritten <SELECTED_TEXT> with no surrounding tags, no preamble, and no explanation.",
  ].join("\n"),
  deep: [
    SYSTEM_PROMPT,
    "You are performing a deep editorial rewrite of a selected passage from a blog post.",
    "Rewrite <SELECTED_TEXT> only.",
    "Read <REFERENCE_CONTEXT_BEFORE> and <REFERENCE_CONTEXT_AFTER> only for tone and continuity.",
    "Do not change facts, meaning, or viewpoint.",
    "Preserve Markdown formatting.",
    "You may substantially rewrite wording, sentence structure, and paragraph flow for clarity and force.",
    "You may tighten redundancy, reorder clauses, split or merge sentences, and sharpen transitions.",
    "Keep roughly the same overall length and information density.",
    "Do not add new claims, examples, evidence, bullet points, or conclusions that are not supported by the original text.",
    "Do not output, repeat, summarize, paraphrase, or continue any text from <REFERENCE_CONTEXT_BEFORE> or <REFERENCE_CONTEXT_AFTER>.",
    "Do not continue the article beyond <SELECTED_TEXT>.",
    "Return ONLY the rewritten <SELECTED_TEXT> with no surrounding tags, no preamble, and no explanation.",
  ].join("\n"),
  styled: [
    SYSTEM_PROMPT,
    "You are performing a style-driven editorial rewrite of a selected passage from a blog post.",
    "Rewrite <SELECTED_TEXT> only.",
    "Read <REFERENCE_CONTEXT_BEFORE> and <REFERENCE_CONTEXT_AFTER> only for tone and continuity.",
    "Follow <STYLE_PROFILE> as a stylistic target, while preserving facts, meaning, and viewpoint.",
    "Preserve Markdown formatting.",
    "You may substantially rewrite wording, sentence structure, emphasis, and paragraph flow to better fit the style.",
    "Make the passage sharper, cleaner, and more distinctive, but keep it credible and grounded.",
    "Keep roughly the same overall length and information density.",
    "Do not add new claims, examples, evidence, bullet points, or conclusions that are not supported by the original text.",
    "Do not output, repeat, summarize, paraphrase, or continue any text from <REFERENCE_CONTEXT_BEFORE> or <REFERENCE_CONTEXT_AFTER>.",
    "Do not continue the article beyond <SELECTED_TEXT>.",
    "Return ONLY the rewritten <SELECTED_TEXT> with no surrounding tags, no preamble, and no explanation.",
  ].join("\n"),
};

const POLISH_TEMPERATURE: Record<PostPolishMode, number> = {
  light: 0.45,
  deep: 0.72,
  styled: 0.8,
};

const TRANSLATE_SYSTEM_PROMPT = [
  "You are a professional bilingual translator for blog posts.",
  "Output Markdown only — no explanations, no code fences wrapping the whole response.",
  "Preserve Markdown structure: headings, lists, links, code blocks, and inline formatting.",
  "Translate <SELECTED_TEXT> only.",
  "Detect the language of <SELECTED_TEXT>: if it is English, translate into natural Chinese; if it is Chinese, translate into natural English.",
  "Read <REFERENCE_CONTEXT_BEFORE> and <REFERENCE_CONTEXT_AFTER> only to resolve meaning, terminology, tone, and continuity.",
  "Use context to choose accurate terms, pronouns, and phrasing, but do not translate or output the surrounding context.",
  "Keep technical terms, product names, and proper nouns consistent with the article context when appropriate.",
  "Do not add, omit, or reinterpret content beyond what is needed for a faithful translation.",
  "Return ONLY the translated <SELECTED_TEXT> with no surrounding tags, no preamble, and no explanation.",
].join("\n");

function translateMaxTokens(selection: string): number {
  const charCount = selection.trim().length;
  return Math.min(1280, Math.max(160, Math.ceil(charCount * 2)));
}

export async function generatePostContent(
  input: PostContentInput
): Promise<string> {
  const model = getAiModel();

  if (input.action === "translate") {
    const selection = input.selection.trim();
    const selectionParagraphs = countParagraphs(selection);

    const raw = await createChatCompletion({
      model,
      temperature: 0.3,
      max_tokens: translateMaxTokens(selection),
      messages: [
        {
          role: "system",
          content: TRANSLATE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: buildTranslateUserPrompt({
            title: input.title,
            selection,
            before: input.before,
            after: input.after,
          }),
        },
      ],
    });

    let text = stripMarkdownFence(raw);
    if (!text) throw new Error("AI 返回了空内容，请重试");

    if (countParagraphs(text) > selectionParagraphs) {
      text = text
        .trim()
        .split(/\n\s*\n/)
        .slice(0, selectionParagraphs)
        .join("\n\n")
        .trim();
    }

    if (!text) throw new Error("AI 返回了空内容，请重试");
    return text;
  }

  if (input.action === "polish") {
    const mode = input.mode;
    const selection = input.selection.trim();
    const selectionParagraphs = countParagraphs(selection);

    const raw = await createChatCompletion({
      model,
      temperature: POLISH_TEMPERATURE[mode],
      max_tokens: polishMaxTokens(selection, mode),
      messages: [
        {
          role: "system",
          content: POLISH_PROMPTS[mode],
        },
        {
          role: "user",
          content: buildPolishUserPrompt({
            mode,
            title: input.title,
            selection,
            before: input.before,
            after: input.after,
          }),
        },
      ],
    });

    let text = stripMarkdownFence(raw);
    if (!text) throw new Error("AI 返回了空内容，请重试");

    if (mode === "light" && countParagraphs(text) > selectionParagraphs) {
      text = text
        .trim()
        .split(/\n\s*\n/)
        .slice(0, selectionParagraphs)
        .join("\n\n")
        .trim();
    }

    if (!text) throw new Error("AI 返回了空内容，请重试");
    return text;
  }

  const before = input.before;
  if (!before.trim()) {
    throw new Error("请先输入一些正文内容再续写");
  }

  const raw = await createChatCompletion({
    model,
    temperature: 0.7,
    max_tokens: 1536,
    messages: [
      {
        role: "system",
        content: [
          SYSTEM_PROMPT,
          "You are writing text to be inserted at the current cursor position inside an existing article.",
          "Use <TEXT_BEFORE_CURSOR> as the immediate context before the insertion point.",
          "Use <TEXT_AFTER_CURSOR> as the immediate context after the insertion point.",
          "Output only the text that should be inserted at the cursor — do not repeat the surrounding context.",
          "Match the tone, style, structure, and Markdown formatting of the surrounding article.",
          "If the sentence before the cursor is incomplete, continue it naturally.",
          "If text exists after the cursor, make the inserted text connect smoothly into it without duplicating, contradicting, or preempting it.",
          "Do not act like the article ends at the cursor unless the after-context is empty.",
        ].join("\n"),
      },
      {
        role: "user",
        content: buildContinueUserPrompt({
          title: input.title,
          before: input.before,
          after: input.after,
        }),
      },
    ],
  });

  const text = stripMarkdownFence(raw);
  if (!text) throw new Error("AI 返回了空内容，请重试");
  return text;
}
