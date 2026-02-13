import { NextRequest, NextResponse } from "next/server";
import { getStockBars } from "@/lib/stock/service";
import type { Timespan } from "@/lib/stock/types";

const VALID_TIMESPANS = new Set<string>(["minute", "hour", "day", "week", "month"]);

/**
 * GET /api/stock/AAPL/bars?timespan=day&from=2025-08-01&to=2026-02-01&multiplier=1
 * 获取 K 线行情（OHLC）
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  try {
    const { ticker } = await params;
    const searchParams = req.nextUrl.searchParams;

    const timespan = searchParams.get("timespan");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const multiplier = parseInt(searchParams.get("multiplier") ?? "1", 10) || 1;

    // 参数校验
    if (!timespan || !from || !to) {
      return NextResponse.json(
        { error: "缺少必需参数: timespan, from, to" },
        { status: 400 },
      );
    }

    if (!VALID_TIMESPANS.has(timespan)) {
      return NextResponse.json(
        { error: `无效的 timespan: ${timespan}，可选值: minute, hour, day, week, month` },
        { status: 400 },
      );
    }

    const bars = await getStockBars(ticker, timespan as Timespan, from, to, multiplier);

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      timespan,
      from,
      to,
      count: bars.length,
      results: bars,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
