import { classifyImage } from "./classifier";
import { dispatchParser } from "./parsers";
import { visionCompletion } from "@/lib/ai/client";
import { enrichParseResult } from "@/lib/ai/enrichment";
import type { ImageParseOutput } from "./types";

/**
 * 图片解析 Pipeline（三阶段）
 *
 * Step 1 — 分类：Vision 判断图片属于 trade_record / position / unknown
 * Step 2 — 提取：按类型使用专属 Zod Schema + withStructuredOutput 提取结构化数据
 * Step 3 — Enrichment：查找正确 ticker、自动填充币种
 *
 * 若分类为 unknown 则退化为普通 OCR 返回原始文字
 *
 * @param imageUrl  Base64 data URL
 * @param context   可选的用户文字上下文，辅助分类和提取
 */
export async function parseImage(
  imageUrl: string,
  context?: string,
): Promise<ImageParseOutput> {
  // Step 1: 分类（附带 context 辅助判断）
  const classify = await classifyImage(imageUrl, context);

  // Step 2: 按类型提取 / 兜底 OCR
  let data = null;
  let rawText: string | undefined;

  if (classify.type === "unknown") {
    const ocrPrompt = context
      ? `用户说明：${context}\n\n请提取这张图片中的所有文字内容，并按原始排版格式输出。`
      : "请提取这张图片中的所有文字内容，并按原始排版格式输出。";
    rawText = await visionCompletion(imageUrl, ocrPrompt);
  } else {
    data = await dispatchParser(imageUrl, classify.type, context);
  }

  const rawResult: ImageParseOutput = {
    type: classify.type,
    confidence: classify.confidence,
    reason: classify.reason,
    data,
    rawText,
  };

  // Step 3: Enrichment — 查找正确 ticker + 自动填充币种
  if (rawResult.data) {
    return enrichParseResult(rawResult);
  }

  return rawResult;
}
