import type { ChatMessage, ChatCompletionResponse } from "./types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("未配置 OPENAI_API_KEY");
  return key;
}

/** 调用 OpenAI Chat Completion API */
export async function chatCompletion(
  messages: ChatMessage[],
  options?: { model?: string; maxTokens?: number; temperature?: number },
): Promise<string> {
  const { model = DEFAULT_MODEL, maxTokens = 2048, temperature } = options ?? {};

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      ...(temperature !== undefined && { temperature }),
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI API 调用失败 (${response.status}): ${detail}`);
  }

  const data: ChatCompletionResponse = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** 带图片的 Chat Completion（视觉分析） */
export async function visionCompletion(
  imageUrl: string,
  prompt: string,
  options?: { model?: string; maxTokens?: number },
): Promise<string> {
  return chatCompletion(
    [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    options,
  );
}
