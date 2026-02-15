import { HumanMessage } from "@langchain/core/messages";
import { getModel } from "@/lib/ai/client";
import { PositionParseSchema, type PositionParseResult } from "../types";
import { PARSE_POSITION_PROMPT } from "@/lib/ai/prompts";

/**
 * 从持仓截图中提取结构化持仓数据
 * 使用 Vision + withStructuredOutput 确保类型安全
 */
export async function parsePositions(
  imageUrl: string,
  context?: string,
): Promise<PositionParseResult> {
  const model = await getModel("vision");
  const structured = model.withStructuredOutput(PositionParseSchema);

  const prompt = context
    ? `${PARSE_POSITION_PROMPT}\n\n用户附带说明：${context}`
    : PARSE_POSITION_PROMPT;

  const message = new HumanMessage({
    content: [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageUrl } },
    ],
  });

  return structured.invoke([message]);
}
