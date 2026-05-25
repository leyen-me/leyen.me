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

export async function generatePostContent(
  input: PostContentInput
): Promise<string> {
  const model = getAiModel();

  if (input.action === "polish") {
    const contextParts: string[] = [];
    if (input.before?.trim()) {
      contextParts.push(`Text before selection:\n${input.before.trim()}`);
    }
    contextParts.push(`Selected text to polish:\n${input.selection.trim()}`);
    if (input.after?.trim()) {
      contextParts.push(`Text after selection:\n${input.after.trim()}`);
    }

    const raw = await createChatCompletion({
      model,
      temperature: 0.5,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: [
            SYSTEM_PROMPT,
            "Improve clarity and flow without changing facts or meaning.",
            "Do not add or remove sections; keep the same structure.",
            "Return only the polished version of the selected text.",
          ].join("\n"),
        },
        {
          role: "user",
          content: [
            `Article title: ${input.title}`,
            ...contextParts,
          ].join("\n\n"),
        },
      ],
    });

    const text = stripMarkdownFence(raw);
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
