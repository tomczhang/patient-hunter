import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/ai/client";
import type { StockSearchResult } from "@/lib/stock/types";

const SYSTEM_PROMPT = `你是一个股票识别助手。用户会输入一个模糊的股票查询（可能是中文名、英文名、简称、代码等），你需要从美股、港股、A股中找到最可能匹配的股票。

返回一个 JSON 数组，每个元素包含：
- ticker: 股票代码（美股如 "AAPL"，港股如 "0700.HK"，A股上交所如 "600519.SS"，深交所如 "000858.SZ"）
- name: 英文全称
- nameCN: 中文名称
- primaryExchange: 交易所（如 "NASDAQ", "NYSE", "HKEX", "SSE", "SZSE"）
- type: 类型（如 "CS" 表示普通股, "ETF"）
- currencyName: 交易货币（如 "usd", "hkd", "cny"）

规则：
1. 最多返回 5 个最相关的结果
2. 优先返回最知名、市值最大的匹配
3. 如果查询明确指向某只股票，只返回该股票
4. 如果同一公司在多个市场上市（如阿里巴巴 BABA + 9988.HK），都列出
5. 只返回 JSON 数组，不要任何解释文字`;

/**
 * GET /api/stock/ai-search?q=xxx
 * LLM 智能股票搜索（覆盖美股、港股、A股）
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

    const raw = await chatCompletion([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: q },
    ]);

    // 提取 JSON（兼容 LLM 可能包裹 ```json ... ``` 的情况）
    const jsonStr = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    const results: StockSearchResult[] = JSON.parse(jsonStr);

    return NextResponse.json({ results });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
