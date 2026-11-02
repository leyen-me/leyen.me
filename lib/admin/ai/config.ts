export class AiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiConfigError";
  }
}

/** DeepSeek-V4.1-Flash / V4-Pro limits from the official model list. */
export const AI_CONTEXT_WINDOW = 1_048_576;
export const AI_MAX_OUTPUT_TOKENS = 393_216;

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
  return /reasoner|-pro$|-pro-/i.test(model);
}

/** Admin AI tasks output JSON — use deepseek-flash with thinking mode disabled. */
export function getAiModel(): string {
  const configured =
    process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "deepseek-flash";

  if (isLikelyReasoningModel(configured)) {
    console.warn(
      `[ai] AI_MODEL "${configured}" is a reasoning model and may truncate JSON. Falling back to deepseek-flash.`
    );
    return "deepseek-flash";
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
