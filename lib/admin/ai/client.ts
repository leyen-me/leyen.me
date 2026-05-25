import { requireAiConfig } from "@/lib/admin/ai/config";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatCompletionOptions = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
};

export class AiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AiRequestError";
    this.status = status;
  }
}

type OpenAIChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function createChatCompletion(
  options: ChatCompletionOptions
): Promise<string> {
  const { apiKey, baseUrl, model } = requireAiConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model ?? model,
      messages: options.messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 256,
      ...(options.response_format
        ? { response_format: options.response_format }
        : {}),
    }),
  });

  const data = (await response.json()) as OpenAIChatCompletionResponse;

  if (!response.ok) {
    throw new AiRequestError(
      data.error?.message ?? "AI request failed",
      response.status
    );
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new AiRequestError("AI returned an empty response", 502);
  }

  return content;
}
