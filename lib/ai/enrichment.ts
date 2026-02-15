import { searchStocks } from "@/lib/stock/service";
import { chatCompletion } from "@/lib/ai/client";
import { inferCurrency } from "@/lib/ai/tools/stock-lookup";
import type {
  ImageParseOutput,
  TradeParseResult,
  PositionParseResult,
} from "@/lib/ai/image-pipeline/types";
import type { StockSearchResult } from "@/lib/stock/types";

/**
 * ai-search fallback（内部函数）
 */
const AI_SEARCH_PROMPT = `你是一个股票识别助手。用户会输入一个模糊的股票查询，你需要从美股、港股、A股中找到最可能匹配的股票。
返回一个 JSON 数组，每个元素包含：ticker, name, nameCN, primaryExchange, currencyName。
最多返回 3 个结果。只返回 JSON 数组。`;

async function aiSearchFallback(query: string): Promise<StockSearchResult[]> {
  try {
    const raw = await chatCompletion([
      { role: "system", content: AI_SEARCH_PROMPT },
      { role: "user", content: query },
    ]);
    const jsonStr = raw.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

/**
 * 根据名称查找股票的正确 ticker 和 currency
 * 1. searchStocks (本地DB + Massive API)
 * 2. aiSearchFallback (LLM)
 * 3. 找不到 → UNKNOWN
 */
async function lookupStock(
  nameOrTicker: string,
): Promise<{ ticker: string; name: string; currency: string }> {
  if (!nameOrTicker || nameOrTicker.trim() === "") {
    return { ticker: "UNKNOWN", name: "", currency: "" };
  }

  // 1) 先查本地 + Massive
  const results = await searchStocks(nameOrTicker, 3);
  if (results.length > 0) {
    const top = results[0];
    return {
      ticker: top.ticker,
      name: top.nameCN || top.name,
      currency: top.currencyName
        ? top.currencyName.toUpperCase()
        : inferCurrency(top.ticker),
    };
  }

  // 2) AI 搜索 fallback
  const aiResults = await aiSearchFallback(nameOrTicker);
  if (aiResults.length > 0) {
    const top = aiResults[0];
    return {
      ticker: top.ticker,
      name: top.nameCN || top.name,
      currency: top.currencyName
        ? top.currencyName.toUpperCase()
        : inferCurrency(top.ticker),
    };
  }

  // 3) 找不到
  return { ticker: "UNKNOWN", name: nameOrTicker, currency: "" };
}

/**
 * 对 ImageParseOutput 做 enrichment：
 *  - 查找每只股票的正确 ticker
 *  - 自动填充 currency（港股 HKD / 美股 USD / A股 CNY）
 *  - 找不到的 ticker 标记为 "UNKNOWN"
 */
export async function enrichParseResult(
  result: ImageParseOutput,
): Promise<ImageParseOutput> {
  if (!result.data) return result;

  if (result.type === "trade_record") {
    const data = result.data as TradeParseResult;
    const enrichedTrades = await Promise.all(
      data.trades.map(async (trade) => {
        // 用名称或 ticker 查找
        const query = trade.name || trade.ticker;
        const lookup = await lookupStock(query);

        return {
          ...trade,
          ticker: lookup.ticker,
          name: trade.name || lookup.name,
          // 只在没有币种时自动填充
          currency: trade.currency || lookup.currency || undefined,
        };
      }),
    );

    return {
      ...result,
      data: { trades: enrichedTrades },
    };
  }

  if (result.type === "position") {
    const data = result.data as PositionParseResult;
    const enrichedPositions = await Promise.all(
      data.positions.map(async (pos) => {
        const query = pos.name || pos.ticker;
        const lookup = await lookupStock(query);

        return {
          ...pos,
          ticker: lookup.ticker,
          name: pos.name || lookup.name,
          currency: pos.currency || lookup.currency || undefined,
        };
      }),
    );

    return {
      ...result,
      data: { positions: enrichedPositions },
    };
  }

  return result;
}
