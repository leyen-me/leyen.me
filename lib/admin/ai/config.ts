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
