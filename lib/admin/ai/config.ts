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

function isLikelyReasoningModel(model: string): boolean {
  return /reasoner|deepseek-v4|-pro$|-flash$/i.test(model);
}

/** All admin AI tasks — JSON output should use deepseek-chat, not reasoning models. */
export function getAiModel(): string {
  const configured =
    process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "deepseek-chat";

  if (isLikelyReasoningModel(configured)) {
    console.warn(
      `[ai] AI_MODEL "${configured}" uses reasoning/thinking and may truncate JSON. Falling back to deepseek-chat.`
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
