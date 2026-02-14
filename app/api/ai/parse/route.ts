import { NextRequest, NextResponse } from "next/server";
import { parseImage } from "@/lib/ai/image-pipeline/pipeline";

/**
 * POST /api/ai/parse
 * 智能图片解析：自动分类 + 结构化提取
 *
 * Body: { imageBase64: "data:image/png;base64,..." }
 * Response: { type, confidence, reason, data, rawText? }
 */
export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "缺少 imageBase64 参数" },
        { status: 400 },
      );
    }

    const result = await parseImage(imageBase64);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    console.error("[/api/ai/parse] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
