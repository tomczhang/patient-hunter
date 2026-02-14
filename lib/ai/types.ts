/**
 * AI 模块类型定义
 * 注：底层已切换为 LangChain，此文件保留业务层复用的类型
 */

/** 简单对话消息（供 chatCompletion 使用） */
export interface SimpleMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
