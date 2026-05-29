import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiModel } from "@/lib/admin/ai/config";

const polishInputSchema = z.object({
  action: z.literal("polish"),
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

function polishMaxTokens(selection: string): number {
  const charCount = selection.trim().length;
  return Math.min(1024, Math.max(128, Math.ceil(charCount * 1.5)));
}

function buildPolishUserPrompt(input: {
  title: string;
  selection: string;
  before?: string;
  after?: string;
}): string {
  const parts = [`Article title: ${input.title}`];

  const contextLines: string[] = [];
  if (input.before?.trim()) {
    contextLines.push(`Before selection:\n${input.before.trim()}`);
  }
  if (input.after?.trim()) {
    contextLines.push(`After selection:\n${input.after.trim()}`);
  }
  if (contextLines.length > 0) {
    parts.push(
      [
        "Surrounding context (reference only — do NOT output, repeat, or continue into this):",
        contextLines.join("\n\n"),
      ].join("\n")
    );
  }

  parts.push(
    [
      "Selected text (rewrite ONLY this block):",
      input.selection.trim(),
    ].join("\n")
  );

  return parts.join("\n\n");
}

const POLISH_SYSTEM_PROMPT = [
  SYSTEM_PROMPT,
  "Rewrite ONLY the selected text block for clarity, flow, and wording.",
  "Do not change facts, meaning, or argument.",
  "Keep the same structure: same number of paragraphs, headings, and list items.",
  "Surrounding context is for tone and continuity reference only.",
  "Never output, paraphrase, summarize, or continue into the before/after context.",
  "Never add new paragraphs, sections, or bullet points.",
  "Return ONLY the polished selected text — no preamble, no explanation.",
].join("\n");

export async function generatePostContent(
  input: PostContentInput
): Promise<string> {
  const model = getAiModel();

  if (input.action === "polish") {
    const selection = input.selection.trim();
    const selectionParagraphs = countParagraphs(selection);

    const raw = await createChatCompletion({
      model,
      temperature: 0.5,
      max_tokens: polishMaxTokens(selection),
      messages: [
        {
          role: "system",
          content: POLISH_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: buildPolishUserPrompt({
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
