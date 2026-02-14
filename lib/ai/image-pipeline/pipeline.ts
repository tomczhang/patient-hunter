import { classifyImage } from "./classifier";
import { dispatchParser } from "./parsers";
import { visionCompletion } from "@/lib/ai/client";
import type { ImageParseOutput } from "./types";

/**
 * 图片解析 Pipeline（两阶段 Vision）
 *
 * Step 1 — 分类：Vision 判断图片属于 trade_record / position / unknown
 * Step 2 — 提取：按类型使用专属 Zod Schema + withStructuredOutput 提取结构化数据
 *
 * 若分类为 unknown 则退化为普通 OCR 返回原始文字
 */
export async function parseImage(imageUrl: string): Promise<ImageParseOutput> {
  // Step 1: 分类
  const classify = await classifyImage(imageUrl);

  // Step 2: 按类型提取 / 兜底 OCR
  let data = null;
  let rawText: string | undefined;

  if (classify.type === "unknown") {
    // 无法识别类型时退化为 OCR
    rawText = await visionCompletion(
      imageUrl,
      "请提取这张图片中的所有文字内容，并按原始排版格式输出。",
    );
  } else {
    data = await dispatchParser(imageUrl, classify.type);
  }

  return {
    type: classify.type,
    confidence: classify.confidence,
    reason: classify.reason,
    data,
    rawText,
  };
}
