import { HumanMessage } from "@langchain/core/messages";
import { getModel } from "@/lib/ai/client";
import { TradeParseSchema, type TradeParseResult } from "../types";
import { PARSE_TRADE_PROMPT } from "@/lib/ai/prompts";

/**
 * 从交易记录截图中提取结构化交易数据
 * 使用 Vision + withStructuredOutput 确保类型安全
 */
export async function parseTrades(
  imageUrl: string,
): Promise<TradeParseResult> {
  const model = await getModel("vision");
  const structured = model.withStructuredOutput(TradeParseSchema);

  const message = new HumanMessage({
    content: [
      { type: "text", text: PARSE_TRADE_PROMPT },
      { type: "image_url", image_url: { url: imageUrl } },
    ],
  });

  return structured.invoke([message]);
}
