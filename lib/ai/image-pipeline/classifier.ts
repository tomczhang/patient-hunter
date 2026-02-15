import { HumanMessage } from "@langchain/core/messages";
import { getModel } from "@/lib/ai/client";
import { ClassifySchema, type ClassifyResult } from "./types";
import { CLASSIFY_IMAGE_PROMPT } from "@/lib/ai/prompts";

/**
 * Step 1：对图片进行分类
 * 使用 Vision 模型判断图片属于哪种类型（交易记录 / 持仓截图 / 未知）
 *
 * @param imageUrl  Base64 data URL
 * @param context   可选的用户文字上下文，辅助分类判断
 */
export async function classifyImage(
  imageUrl: string,
  context?: string,
): Promise<ClassifyResult> {
  const model = await getModel("vision");
  const structured = model.withStructuredOutput(ClassifySchema);

  const prompt = context
    ? `${CLASSIFY_IMAGE_PROMPT}\n\n用户附带说明：${context}`
    : CLASSIFY_IMAGE_PROMPT;

  const message = new HumanMessage({
    content: [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: imageUrl } },
    ],
  });

  return structured.invoke([message]);
}
