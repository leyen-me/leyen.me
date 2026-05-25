import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { getAiFastModel } from "@/lib/admin/ai/config";
import { parseJsonResponse, previewText } from "@/lib/admin/ai/parse-json";
import { isValidSlug, normalizeSlug } from "@/lib/utils";

export const postSlugInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
});

export type PostSlugInput = z.infer<typeof postSlugInputSchema>;

const slugResponseSchema = z.object({
  slug: z.string(),
});

export async function generatePostSlug(input: PostSlugInput): Promise<string> {
  const model = getAiFastModel();

  const raw = await createChatCompletion({
    model,
    temperature: 0.2,
    max_tokens: 80,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You generate concise English URL slugs for blog posts based on the title.",
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
    console.error("[ai/post-slug] Invalid JSON response", {
      model,
      title: input.title,
      raw: previewText(raw),
      error,
    });
    throw new Error("AI 返回格式异常，请重试");
  }

  const parsed = slugResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    console.error("[ai/post-slug] Missing slug field", {
      model,
      title: input.title,
      raw: previewText(raw),
      parsedJson,
    });
    throw new Error("AI 未返回 slug 字段，请重试");
  }

  const slug = normalizeSlug(parsed.data.slug);
  if (!slug || !isValidSlug(slug)) {
    console.error("[ai/post-slug] Invalid slug value", {
      model,
      title: input.title,
      slug: parsed.data.slug,
      normalized: slug,
    });
    throw new Error("AI 生成的 slug 不符合规则，请重试");
  }

  return slug;
}
