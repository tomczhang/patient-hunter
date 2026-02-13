import { NextRequest, NextResponse } from "next/server";
import { visionCompletion } from "@/lib/ai/client";
import { OCR_PROMPT } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, prompt } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "缺少 imageBase64 参数" }, { status: 400 });
    }

    const text = await visionCompletion(imageBase64, prompt || OCR_PROMPT);

    return NextResponse.json({ text });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    const status = message.includes("未配置") ? 500 : message.includes("调用失败") ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
