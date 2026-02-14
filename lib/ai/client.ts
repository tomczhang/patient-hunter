import { initChatModel } from "langchain";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

// ============ 模型配置 ============

interface ModelProfile {
  model: string;
  provider: string;
  temperature?: number;
  maxTokens?: number;
  /** OpenAI 兼容端点自定义 baseURL（如通义千问 DashScope） */
  baseURL?: string;
  /** 自定义 API Key 环境变量名（默认读 OPENAI_API_KEY） */
  apiKeyEnv?: string;
}

/** 按用途定义模型档案，可通过 .env 灵活覆盖 */
function getProfile(useCase: "chat" | "vision"): ModelProfile {
  if (useCase === "vision") {
    return {
      model: process.env.AI_VISION_MODEL || "gpt-4o-mini",
      provider: process.env.AI_VISION_PROVIDER || "openai",
      baseURL: process.env.AI_VISION_BASE_URL || undefined,
      apiKeyEnv: process.env.AI_VISION_API_KEY ? "AI_VISION_API_KEY" : undefined,
      temperature: 0,
      maxTokens: 2048,
    };
  }
  return {
    model: process.env.AI_CHAT_MODEL || "gpt-4o-mini",
    provider: process.env.AI_CHAT_PROVIDER || "openai",
    baseURL: process.env.AI_CHAT_BASE_URL || undefined,
    apiKeyEnv: process.env.AI_CHAT_API_KEY ? "AI_CHAT_API_KEY" : undefined,
    temperature: 0,
    maxTokens: 2048,
  };
}

// ============ 模型单例缓存 ============

const modelCache = new Map<string, BaseChatModel>();

export async function getModel(useCase: "chat" | "vision"): Promise<BaseChatModel> {
  const cacheKey = useCase;
  if (modelCache.has(cacheKey)) return modelCache.get(cacheKey)!;

  const profile = getProfile(useCase);

  // 解析 API Key
  const apiKey = profile.apiKeyEnv
    ? process.env[profile.apiKeyEnv]
    : process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      `未配置 API Key（${profile.apiKeyEnv || "OPENAI_API_KEY"}）`,
    );
  }

  const model = await initChatModel(profile.model, {
    modelProvider: profile.provider,
    temperature: profile.temperature,
    maxTokens: profile.maxTokens,
    apiKey,
    ...(profile.baseURL && {
      configuration: { baseURL: profile.baseURL },
    }),
  });

  modelCache.set(cacheKey, model);
  return model;
}

// ============ 对外接口（保持向后兼容） ============

export interface SimpleMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * 文本对话（翻译、分析等通用场景）
 * 参照 langChainTest.mjs 使用 initChatModel + invoke
 */
export async function chatCompletion(
  messages: SimpleMessage[],
): Promise<string> {
  const model = await getModel("chat");

  const lcMessages = messages.map((m) => {
    if (m.role === "system") return new SystemMessage(m.content);
    return new HumanMessage(m.content);
  });

  const result = await model.invoke(lcMessages);
  return typeof result.content === "string" ? result.content : "";
}

/**
 * 图片分析（OCR / 视觉理解）
 * 使用 HumanMessage 的多模态 content 格式
 */
export async function visionCompletion(
  imageUrl: string,
  prompt: string,
): Promise<string> {
  const model = await getModel("vision");

  const message = new HumanMessage({
    content: [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageUrl } },
    ],
  });

  const result = await model.invoke([message]);
  return typeof result.content === "string" ? result.content : "";
}
