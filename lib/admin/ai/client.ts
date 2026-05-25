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
    finish_reason?: string | null;
    message?: {
      content?: string | null;
      reasoning_content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

function getEmptyResponseMessage(
  choice: NonNullable<OpenAIChatCompletionResponse["choices"]>[number] | undefined
): string {
  if (choice?.finish_reason === "length") {
    return "AI 输出被截断（token 上限过低）。推理模型如 deepseek-v4-pro 需要更多 token，建议改用 deepseek-chat。";
  }

  if (choice?.message?.reasoning_content?.trim()) {
    return "AI 推理模型把 token 都用在了思考阶段，未生成最终结果。建议将 AI_MODEL 改为 deepseek-chat。";
  }

  return "AI 返回了空内容，请检查模型名称与 API 配置。";
}

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

  const choice = data.choices?.[0];
  const content = choice?.message?.content?.trim();
  if (!content) {
    throw new AiRequestError(getEmptyResponseMessage(choice), 502);
  }

  return content;
}
