/** Chat message content — 文本 */
export interface TextContent {
  type: "text";
  text: string;
}

/** Chat message content — 图片 */
export interface ImageContent {
  type: "image_url";
  image_url: { url: string };
}

/** Chat message */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | (TextContent | ImageContent)[];
}

/** OpenAI chat completion 请求参数 */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
}

/** OpenAI chat completion 响应 */
export interface ChatCompletionResponse {
  choices: {
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
