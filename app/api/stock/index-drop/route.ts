import { NextResponse } from "next/server";
import { getIndexDrop } from "@/lib/stock/service";

/**
 * GET /api/stock/index-drop
 * 宽指组合跌幅（70% VOO + 30% QQQM）
 */
export async function GET() {
  try {
    const result = await getIndexDrop();

    if (!result) {
      return NextResponse.json(
        { error: "无法获取宽指数据" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
