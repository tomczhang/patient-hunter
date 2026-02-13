import { NextRequest, NextResponse } from "next/server";
import { getSixMonthHigh } from "@/lib/stock/service";

/**
 * GET /api/stock/AAPL/high
 * 获取近 6 个月最高价及日期
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  try {
    const { ticker } = await params;
    const result = await getSixMonthHigh(ticker);

    if (!result) {
      return NextResponse.json(
        { error: "该股票近 6 个月无交易数据" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
