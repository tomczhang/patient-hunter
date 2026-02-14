import { HumanMessage } from "@langchain/core/messages";
import { getModel } from "@/lib/ai/client";
import { ClassifySchema, type ClassifyResult } from "./types";
import { CLASSIFY_IMAGE_PROMPT } from "@/lib/ai/prompts";

/**
 * Step 1：对图片进行分类
 * 使用 Vision 模型判断图片属于哪种类型（交易记录 / 持仓截图 / 未知）
 */
export async function classifyImage(
  imageUrl: string,
): Promise<ClassifyResult> {
  const model = await getModel("vision");
  const structured = model.withStructuredOutput(ClassifySchema);

  const message = new HumanMessage({
    content: [
      { type: "text", text: CLASSIFY_IMAGE_PROMPT },
      { type: "image_url", image_url: { url: imageUrl } },
    ],
  });

  return structured.invoke([message]);
}
