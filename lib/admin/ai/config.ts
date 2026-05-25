export class AiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiConfigError";
  }
}

export function getAiApiKey(): string | undefined {
  return process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
}

export function getAiBaseUrl(): string {
  const baseUrl =
    process.env.AI_BASE_URL ??
    process.env.OPENAI_BASE_URL ??
    "https://api.deepseek.com/v1";

  return baseUrl.replace(/\/+$/, "");
}

export function getAiModel(): string {
  return process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "deepseek-chat";
}

/** Lightweight tasks (slug, tags, etc.) — no reasoning/thinking. */
export function isLikelyReasoningModel(model: string): boolean {
  return /reasoner|deepseek-v4|-pro$|-flash$/i.test(model);
}

export function getAiFastModel(): string {
  const configured = process.env.AI_FAST_MODEL ?? "deepseek-chat";

  if (isLikelyReasoningModel(configured)) {
    console.warn(
      `[ai] AI_FAST_MODEL "${configured}" uses reasoning/thinking. Falling back to deepseek-chat for simple tasks.`
    );
    return "deepseek-chat";
  }

  return configured;
}

export function requireAiConfig() {
  const apiKey = getAiApiKey();
  if (!apiKey) {
    throw new AiConfigError(
      "AI API key is not configured. Set AI_API_KEY in your environment."
    );
  }

  return {
    apiKey,
    baseUrl: getAiBaseUrl(),
    model: getAiModel(),
  };
}
