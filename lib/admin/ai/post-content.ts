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
  content: z.string(),
});

export const postContentInputSchema = z.discriminatedUnion("action", [
  polishInputSchema,
  continueInputSchema,
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

export async function generatePostContent(
  input: PostContentInput
): Promise<string> {
  const model = getAiModel();

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

  const content = input.content.trim();
  if (!content) {
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
          "Continue writing from where the article left off.",
          "Output only new content — do not repeat existing text.",
          "Match the tone and style of the existing article.",
          "If the last sentence is incomplete, finish it naturally before adding new paragraphs.",
        ].join("\n"),
      },
      {
        role: "user",
        content: `Article title: ${input.title}\n\nExisting content:\n${content}`,
      },
    ],
  });

  const text = stripMarkdownFence(raw);
  if (!text) throw new Error("AI 返回了空内容，请重试");
  return text;
}
