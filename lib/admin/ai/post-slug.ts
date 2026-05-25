import { z } from "zod";
import { createChatCompletion } from "@/lib/admin/ai/client";
import { isValidSlug, normalizeSlug } from "@/lib/utils";

export const postSlugInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  content: z.string().trim().optional(),
});

export type PostSlugInput = z.infer<typeof postSlugInputSchema>;

const slugResponseSchema = z.object({
  slug: z.string(),
});

function buildPrompt(input: PostSlugInput) {
  const contentExcerpt = input.content?.slice(0, 800);

  return [
    `Title: ${input.title}`,
    input.description ? `Description: ${input.description}` : null,
    contentExcerpt ? `Content excerpt:\n${contentExcerpt}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function generatePostSlug(input: PostSlugInput): Promise<string> {
  const raw = await createChatCompletion({
    temperature: 0.2,
    max_tokens: 80,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You generate concise English URL slugs for blog posts.",
          "Rules:",
          "- Use only lowercase letters, digits, and hyphens",
          "- Must start with a lowercase letter",
          "- Prefer 3 to 6 meaningful words joined by hyphens",
          "- Avoid filler words like the, a, an, and, of",
          "- For non-English titles, translate or transliterate the meaning into English",
          'Return JSON only: {"slug":"example-slug"}',
        ].join("\n"),
      },
      {
        role: "user",
        content: buildPrompt(input),
      },
    ],
  });

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const parsed = slugResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error("AI response is missing slug");
  }

  const slug = normalizeSlug(parsed.data.slug);
  if (!slug || !isValidSlug(slug)) {
    throw new Error("AI returned an invalid slug");
  }

  return slug;
}
