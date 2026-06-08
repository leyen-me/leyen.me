import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiModel } from "@/lib/admin/ai/config";
import { parseJsonResponse, previewText } from "@/lib/admin/ai/parse-json";
import { isValidSlug, normalizeSlug } from "@/lib/utils";

export const slugKinds = ["post", "project", "interview", "movie"] as const;
export type SlugKind = (typeof slugKinds)[number];

export const slugInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  kind: z.enum(slugKinds).optional().default("post"),
});

export type SlugInput = z.infer<typeof slugInputSchema>;

const slugResponseSchema = z.object({
  slug: z.string(),
});

const KIND_LABELS: Record<SlugKind, string> = {
  post: "blog posts",
  project: "software projects",
  interview: "frontend interview questions",
  movie: "movies and TV shows",
};

export async function generateSlug(input: SlugInput): Promise<string> {
  const kind = input.kind ?? "post";
  const model = getAiModel();

  const raw = await createChatCompletion({
    model,
    temperature: 0.2,
    max_tokens: 80,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          `You generate concise English URL slugs for ${KIND_LABELS[kind]} based on the title.`,
          "Rules:",
          "- Use only lowercase letters, digits, and hyphens",
          "- Must start with a lowercase letter",
          "- Prefer 3 to 6 meaningful words joined by hyphens",
          "- Avoid filler words like the, a, an, and, of",
          "- For non-English titles, translate the meaning into English",
          'Return JSON only: {"slug":"example-slug"}',
        ].join("\n"),
      },
      {
        role: "user",
        content: `Title: ${input.title}`,
      },
    ],
  });

  let parsedJson: unknown;
  try {
    parsedJson = parseJsonResponse(raw);
  } catch (error) {
    console.error("[ai/slug] Invalid JSON response", {
      model,
      kind,
      title: input.title,
      raw: previewText(raw),
      error,
    });
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = slugResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    console.error("[ai/slug] Missing slug field", {
      model,
      kind,
      title: input.title,
      raw: previewText(raw),
      parsedJson,
    });
    throw new Error("AI 未返回 slug 字段，请重试");
  }

  const slug = normalizeSlug(parsed.data.slug);
  if (!slug || !isValidSlug(slug)) {
    console.error("[ai/slug] Invalid slug value", {
      model,
      kind,
      title: input.title,
      slug: parsed.data.slug,
      normalized: slug,
    });
    throw new Error("AI 生成的 slug 不符合规则，请重试");
  }

  return slug;
}
