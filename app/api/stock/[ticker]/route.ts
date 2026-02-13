import { NextRequest, NextResponse } from "next/server";
import { getStockDetail } from "@/lib/stock/service";

/**
 * GET /api/stock/AAPL
 * 获取单只股票详情（含中文名自动翻译）
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  try {
    const { ticker } = await params;
    const detail = await getStockDetail(ticker);

    if (!detail) {
      return NextResponse.json(
        { error: "未找到该股票" },
        { status: 404 },
      );
    }

    return NextResponse.json(detail);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
