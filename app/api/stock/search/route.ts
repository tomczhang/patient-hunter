import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/stock/service";

/**
 * GET /api/stock/search?q=xxx&limit=10
 * 搜索股票（支持中英文）
 */
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json(
        { error: "缺少搜索关键词" },
        { status: 400 },
      );
    }

    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10) || 10,
      50,
    );

    const results = await searchStocks(q, limit);
    return NextResponse.json({ results });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
