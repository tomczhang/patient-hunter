import { NextRequest, NextResponse } from "next/server";
import { ToolMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { AIMessage, BaseMessage } from "@langchain/core/messages";
import { getModel } from "@/lib/ai/client";
import { PARSE_TEXT_PROMPT } from "@/lib/ai/prompts";
import { stockSearchTool } from "@/lib/ai/tools/stock-lookup";
import type { ImageParseOutput } from "@/lib/ai/image-pipeline/types";

const MAX_TOOL_ROUNDS = 8; // 最多循环调用 8 轮 tool

/**
 * POST /api/ai/parse-text
 * 文本解析（Agent 模式）：
 *   1. LLM 解析用户文本
 *   2. LLM 自主调用 stock_search tool 查找正确 ticker + 币种
 *   3. 返回已 enriched 的结构化数据
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "缺少 text 参数" },
        { status: 400 },
      );
    }

    const model = await getModel("chat");

    // Bind tool 让 LLM 可以调用
    const modelWithTools = model.bindTools!([stockSearchTool]);

    const messages: BaseMessage[] = [
      new SystemMessage(PARSE_TEXT_PROMPT),
      new HumanMessage(text.trim()),
    ];

    // Agent loop — 让 LLM 自主决定是否调用 tool
    let rounds = 0;
    let response = await modelWithTools.invoke(messages);

    while (rounds < MAX_TOOL_ROUNDS) {
      const aiMsg = response as AIMessage;
      const toolCalls = aiMsg.tool_calls;
      if (!toolCalls || toolCalls.length === 0) break;

      // 把 AI 回复（含 tool_call 请求）加入上下文
      messages.push(aiMsg);

      // 逐个执行 tool 调用
      for (const call of toolCalls) {
        const toolResult = await stockSearchTool.invoke(call.args as { query: string });
        messages.push(
          new ToolMessage({
            content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
            tool_call_id: call.id ?? "",
          }),
        );
      }

      // 再次调用 LLM（带上 tool 结果）
      response = await modelWithTools.invoke(messages);
      rounds++;
    }

    // 提取最终文本结果
    const raw = typeof response.content === "string" ? response.content : "";
    const jsonStr = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const result: ImageParseOutput = JSON.parse(jsonStr);

    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    console.error("[/api/ai/parse-text] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
